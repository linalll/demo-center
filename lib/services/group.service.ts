import { addMonths } from "date-fns";
import { db } from "@/lib/db";
import { generateSessionsForGroup, ensureExpectedAttendanceForStudent } from "@/lib/services/attendance.service";
import { chargeForNewGroupMembership } from "@/lib/services/finance.service";
import type { z } from "zod";
import type { createGroupSchema } from "@/lib/validation/group";

type CreateGroupInput = z.infer<typeof createGroupSchema>;

/**
 * Creates a Group with its recurring ScheduleSlots, then immediately
 * generates the next month of concrete Sessions — this is what turns on
 * attendance tracking the moment a group exists (system.md #3/#14).
 */
export async function createGroup(centerId: string, input: CreateGroupInput) {
  const group = await db.group.create({
    data: {
      centerId,
      name: input.name,
      subjectId: input.subjectId,
      teacherId: input.teacherId,
      gradeId: input.gradeId,
      maxStudents: input.maxStudents,
      price: input.price,
      billingModel: input.billingModel,
      scheduleSlots: { create: input.scheduleSlots },
    },
    include: { scheduleSlots: true, subject: true, teacher: { include: { user: true } } },
  });

  await generateSessionsForGroup(group.id, new Date(), addMonths(new Date(), 1));

  return group;
}

export async function addStudentToGroup(groupId: string, studentId: string) {
  const group = await db.group.findUniqueOrThrow({ where: { id: groupId } });

  if (group.maxStudents) {
    const currentCount = await db.groupStudent.count({ where: { groupId, status: "ACTIVE" } });
    if (currentCount >= group.maxStudents) {
      const { ApiError } = await import("@/lib/api/handler");
      throw new ApiError(409, "GROUP_FULL", "المجموعة وصلت للحد الأقصى من الطلاب");
    }
  }

  const membership = await db.groupStudent.upsert({
    where: { groupId_studentId: { groupId, studentId } },
    update: { status: "ACTIVE", leftAt: null },
    create: { groupId, studentId },
  });

  // Backfills expected attendance immediately (system.md #3's core rule).
  await ensureExpectedAttendanceForStudent(groupId, studentId);

  // Kicks off billing for this membership (MONTHLY charges immediately;
  // PER_SESSION accrues as attendance happens; CUSTOM is manual).
  await chargeForNewGroupMembership(studentId, groupId);

  // A student stays INACTIVE (no attendance tracked, hidden from active
  // lists) until they're actually enrolled somewhere — the moment they join
  // their first group, the account goes live.
  await db.student.updateMany({ where: { id: studentId, status: "INACTIVE" }, data: { status: "ACTIVE" } });

  return membership;
}

export async function removeStudentFromGroup(groupId: string, studentId: string) {
  return db.groupStudent.update({
    where: { groupId_studentId: { groupId, studentId } },
    data: { status: "INACTIVE", leftAt: new Date() },
  });
}

export async function listGroups(centerId: string) {
  return db.group.findMany({
    where: { centerId },
    include: {
      subject: true,
      teacher: { include: { user: true } },
      scheduleSlots: { include: { classroom: true } },
      _count: { select: { students: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGroupDetail(groupId: string) {
  return db.group.findUniqueOrThrow({
    where: { id: groupId },
    include: {
      subject: true,
      teacher: { include: { user: true } },
      scheduleSlots: { include: { classroom: true } },
      students: { where: { status: "ACTIVE" }, include: { student: { include: { user: true } } } },
      sessions: { orderBy: { date: "asc" }, take: 20 },
    },
  });
}
