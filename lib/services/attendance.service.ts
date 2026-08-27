import { addDays, isBefore, parse, startOfDay } from "date-fns";
import { AttendanceMethod, AttendanceStatus, DayOfWeek, SessionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api/handler";
import { notifyAttendance } from "@/lib/services/notification.service";
import { applyPerSessionCharge } from "@/lib/services/finance.service";

const JS_DAY_TO_ENUM: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

/**
 * Core rule (system.md #3): a student is only ever expected to attend once
 * the center has created Groups + Schedules AND enrolled the student. This
 * generates concrete Session rows for a Group from its recurring
 * ScheduleSlots, and an ExpectedAttendance row per currently-enrolled
 * student per session — nothing is "absent" until this has run.
 */
export async function generateSessionsForGroup(groupId: string, fromDate: Date, toDate: Date) {
  const [group, students] = await Promise.all([
    db.group.findUniqueOrThrow({ where: { id: groupId }, include: { scheduleSlots: true } }),
    db.groupStudent.findMany({ where: { groupId, status: "ACTIVE" }, select: { studentId: true } }),
  ]);

  const createdSessions: string[] = [];

  for (let day = startOfDay(fromDate); !isBefore(toDate, day); day = addDays(day, 1)) {
    const dayEnum = JS_DAY_TO_ENUM[day.getDay()];
    const slots = group.scheduleSlots.filter((s) => s.dayOfWeek === dayEnum);

    for (const slot of slots) {
      const session = await db.session.upsert({
        where: { groupId_date_startTime: { groupId, date: day, startTime: slot.startTime } },
        update: {},
        create: {
          groupId,
          scheduleSlotId: slot.id,
          date: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      });
      createdSessions.push(session.id);

      for (const { studentId } of students) {
        await db.expectedAttendance.upsert({
          where: { sessionId_studentId: { sessionId: session.id, studentId } },
          update: {},
          create: { sessionId: session.id, studentId },
        });
      }
    }
  }

  return createdSessions;
}

/**
 * Called when a student joins a Group: backfills ExpectedAttendance for any
 * already-generated future sessions of that group so they immediately show
 * up on the prepare-session screen.
 */
export async function ensureExpectedAttendanceForStudent(groupId: string, studentId: string) {
  const futureSessions = await db.session.findMany({
    where: { groupId, date: { gte: startOfDay(new Date()) }, status: "SCHEDULED" },
    select: { id: true },
  });

  for (const session of futureSessions) {
    await db.expectedAttendance.upsert({
      where: { sessionId_studentId: { sessionId: session.id, studentId } },
      update: {},
      create: { sessionId: session.id, studentId },
    });
  }
}

async function resolveGracePeriodMinutes(centerId: string) {
  const center = await db.center.findUniqueOrThrow({ where: { id: centerId } });
  return center.lateAfterMinutes;
}

/**
 * Pure late/present calculation (system.md #18: "Late After: 10 Minutes").
 * Exported standalone (no DB access) so the core attendance rule can be
 * unit-tested without a database.
 */
export function statusForCheckIn(session: { date: Date; startTime: string }, graceMinutes: number, now: Date) {
  const sessionStart = parse(session.startTime, "HH:mm", session.date);
  const lateThreshold = new Date(sessionStart.getTime() + graceMinutes * 60_000);
  return now <= lateThreshold ? AttendanceStatus.PRESENT : AttendanceStatus.LATE;
}

async function findActiveSessionForStudent(studentId: string, now: Date) {
  const today = startOfDay(now);
  return db.session.findFirst({
    where: {
      date: today,
      status: "SCHEDULED",
      group: { students: { some: { studentId, status: "ACTIVE" } } },
      expectedAttendances: { some: { studentId } },
    },
    orderBy: { startTime: "asc" },
    include: { group: { include: { subject: true } } },
  });
}

/**
 * Shared by both QR and NFC check-in — the only difference between the two
 * methods is how the student is resolved (system.md #15/#16).
 */
export async function checkInStudent(input: {
  studentId: string;
  method: AttendanceMethod;
  recordedById?: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  const student = await db.student.findUnique({ where: { id: input.studentId }, include: { user: true } });
  if (!student) throw new ApiError(404, "STUDENT_NOT_FOUND");

  const session = await findActiveSessionForStudent(input.studentId, now);
  if (!session) {
    throw new ApiError(409, "NO_ACTIVE_SESSION", "لا توجد حصة نشطة لهذا الطالب الآن");
  }

  const existing = await db.attendance.findUnique({
    where: { sessionId_studentId: { sessionId: session.id, studentId: input.studentId } },
  });
  if (existing) {
    throw new ApiError(409, "ALREADY_CHECKED_IN", "تم تسجيل حضور الطالب بالفعل");
  }

  const graceMinutes = await resolveGracePeriodMinutes(session.group.centerId);
  const status = statusForCheckIn(session, graceMinutes, now);

  const attendance = await recordAttendance({
    sessionId: session.id,
    studentId: input.studentId,
    status,
    method: input.method,
    checkInTime: now,
    recordedById: input.recordedById,
  });

  return { attendance, session, student };
}

/**
 * Manual attendance override from the Prepare Session screen
 * (system.md #19) — used by Assistants/Admins on mobile.
 */
export async function markManualAttendance(input: {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  recordedById: string;
}) {
  return recordAttendance({
    sessionId: input.sessionId,
    studentId: input.studentId,
    status: input.status,
    method: AttendanceMethod.MANUAL,
    checkInTime: input.status === AttendanceStatus.ABSENT ? null : new Date(),
    recordedById: input.recordedById,
  });
}

async function recordAttendance(input: {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  checkInTime: Date | null;
  recordedById?: string;
}) {
  const attendance = await db.$transaction(async (tx) => {
    const record = await tx.attendance.upsert({
      where: { sessionId_studentId: { sessionId: input.sessionId, studentId: input.studentId } },
      update: {
        status: input.status,
        method: input.method,
        checkInTime: input.checkInTime,
        recordedById: input.recordedById,
      },
      create: {
        sessionId: input.sessionId,
        studentId: input.studentId,
        status: input.status,
        method: input.method,
        checkInTime: input.checkInTime,
        recordedById: input.recordedById,
      },
    });

    await tx.attendanceLog.create({
      data: { attendanceId: record.id, toStatus: input.status, changedById: input.recordedById },
    });

    await tx.expectedAttendance.updateMany({
      where: { sessionId: input.sessionId, studentId: input.studentId },
      data: { resolved: true },
    });

    return record;
  });

  if (attendance.status !== AttendanceStatus.ABSENT) {
    await applyPerSessionCharge(input.studentId, input.sessionId).catch((e) => console.error(e));
  }

  await notifyAttendance(attendance.id).catch((e) => console.error(e));

  return attendance;
}

/**
 * Runs once a session's grace period has elapsed: every enrolled student
 * without a recorded Attendance is converted to ABSENT (system.md #18).
 * Triggered on-demand (e.g. when a prepare-session screen is opened after
 * the session end time, or via an admin action) rather than a background
 * cron, to keep the architecture simple.
 */
export async function closeSessionAndMarkAbsences(sessionId: string) {
  const session = await db.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: { group: true, expectedAttendances: { where: { resolved: false } } },
  });

  const graceMinutes = await resolveGracePeriodMinutes(session.group.centerId);
  const sessionEnd = parse(session.endTime, "HH:mm", session.date);
  const graceDeadline = new Date(sessionEnd.getTime() + graceMinutes * 60_000);

  if (new Date() < graceDeadline) {
    throw new ApiError(409, "GRACE_PERIOD_ACTIVE", "لم تنتهِ فترة السماح بعد لهذه الحصة");
  }

  for (const expected of session.expectedAttendances) {
    await recordAttendance({
      sessionId,
      studentId: expected.studentId,
      status: AttendanceStatus.ABSENT,
      method: AttendanceMethod.MANUAL,
      checkInTime: null,
    });
  }

  await db.session.update({ where: { id: sessionId }, data: { status: SessionStatus.COMPLETED } });
}

export async function getSessionRoster(sessionId: string) {
  const session = await db.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      group: { include: { subject: true, teacher: { include: { user: true } } } },
      expectedAttendances: {
        include: { student: { include: { user: true } } },
      },
      attendances: true,
    },
  });

  const attendanceByStudent = new Map(session.attendances.map((a) => [a.studentId, a]));

  const roster = session.expectedAttendances.map((e) => ({
    student: e.student,
    attendance: attendanceByStudent.get(e.studentId) ?? null,
  }));

  const counts = {
    total: roster.length,
    present: roster.filter((r) => r.attendance?.status === "PRESENT").length,
    late: roster.filter((r) => r.attendance?.status === "LATE").length,
    absent: roster.filter((r) => r.attendance?.status === "ABSENT").length,
    pending: roster.filter((r) => !r.attendance).length,
  };

  return { session, roster, counts };
}
