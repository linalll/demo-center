import { format } from "date-fns";
import { db } from "@/lib/db";
import { sendWhatsAppText } from "@/lib/services/whatsapp/client";
import { renderTemplate } from "@/lib/services/whatsapp/templates";
import { NotificationChannel } from "@prisma/client";

async function dispatchToUser(
  userId: string,
  userPhone: string,
  title: string,
  body: string,
  centerId: string,
) {
  await db.notification.create({
    data: { userId, title, body, channel: NotificationChannel.IN_APP },
  });

  const center = await db.center.findUnique({ where: { id: centerId } });
  if (!center?.whatsappEnabled) return;

  const result = await sendWhatsAppText(userPhone, body);
  await db.whatsAppMessage.create({
    data: {
      toPhone: userPhone,
      templateKey: title,
      variables: {},
      status: result.ok ? "SENT" : "FAILED",
      providerMessageId: result.ok ? result.providerMessageId : undefined,
      error: result.ok ? undefined : result.error,
      sentAt: result.ok ? new Date() : undefined,
    },
  });
}

async function getParentsForStudent(studentId: string) {
  const links = await db.parentStudent.findMany({
    where: { studentId },
    include: { parent: { include: { user: true } } },
  });
  return links.map((l) => l.parent.user);
}

/**
 * Fires after every attendance record is written (present/late/absent) —
 * system.md #20: notify the parent according to center settings.
 */
export async function notifyAttendance(attendanceId: string) {
  const attendance = await db.attendance.findUniqueOrThrow({
    where: { id: attendanceId },
    include: {
      student: { include: { user: true } },
      session: { include: { group: { include: { subject: true, center: true } } } },
    },
  });

  const center = attendance.session.group.center;
  if (!center.attendanceNotificationsEnabled) return;

  const key =
    attendance.status === "PRESENT"
      ? "attendance.present"
      : attendance.status === "LATE"
        ? "attendance.late"
        : "attendance.absent";

  const body = await renderTemplate(center.id, key, {
    student_name: attendance.student.user.fullName,
    subject_name: attendance.session.group.subject.name,
    group_name: attendance.session.group.name,
    date: format(attendance.session.date, "yyyy-MM-dd"),
    time: attendance.checkInTime ? format(attendance.checkInTime, "HH:mm") : attendance.session.startTime,
  });

  const parents = await getParentsForStudent(attendance.studentId);
  for (const parent of parents) {
    await dispatchToUser(parent.id, parent.phone, "تحديث الحضور", body, center.id);
  }
}

export async function notifyExamReminder(examId: string) {
  const exam = await db.exam.findUniqueOrThrow({
    where: { id: examId },
    include: { subject: true, group: { include: { center: true, students: { include: { student: { include: { parents: { include: { parent: { include: { user: true } } } } } } } } } } },
  });

  const body = await renderTemplate(exam.centerId, "exam.reminder", {
    subject_name: exam.subject.name,
    group_name: exam.group.name,
    date: format(exam.date, "yyyy-MM-dd"),
    time: format(exam.date, "HH:mm"),
  });

  for (const membership of exam.group.students) {
    for (const link of membership.student.parents) {
      await dispatchToUser(link.parent.user.id, link.parent.user.phone, "تذكير امتحان", body, exam.centerId);
    }
  }
}

export async function notifyExamResult(examResultId: string) {
  const result = await db.examResult.findUniqueOrThrow({
    where: { id: examResultId },
    include: { student: { include: { user: true, parents: { include: { parent: { include: { user: true } } } } } }, exam: { include: { subject: true, group: { include: { center: true } } } } },
  });

  const body = await renderTemplate(result.exam.group.center.id, "exam.result", {
    student_name: result.student.user.fullName,
    subject_name: result.exam.subject.name,
    amount: result.score.toString(),
    remaining_amount: result.totalMarks.toString(),
  });

  for (const link of result.student.parents) {
    await dispatchToUser(link.parent.user.id, link.parent.user.phone, "نتيجة امتحان", body, result.exam.group.center.id);
  }
}

export async function notifyPayment(paymentId: string) {
  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { student: { include: { user: true, parents: { include: { parent: { include: { user: true } } } } } } },
  });

  const centerId = payment.student.user.centerId;
  const balance = await import("@/lib/services/finance.service").then((m) => m.getStudentBalance(payment.studentId));

  const body = await renderTemplate(centerId, "payment.confirmation", {
    student_name: payment.student.user.fullName,
    amount: payment.amount.toString(),
    remaining_amount: balance.remaining.toString(),
  });

  for (const link of payment.student.parents) {
    await dispatchToUser(link.parent.user.id, link.parent.user.phone, "تأكيد دفعة", body, centerId);
  }
}

/** Notification Center broadcast (system.md #22). */
export async function broadcastNotification(input: {
  centerId: string;
  title: string;
  body: string;
  targetUserIds: string[];
}) {
  const users = await db.user.findMany({ where: { id: { in: input.targetUserIds } } });
  for (const user of users) {
    await dispatchToUser(user.id, user.phone, input.title, input.body, input.centerId);
  }
}

export type BroadcastAudience =
  | { type: "ALL_STUDENTS" }
  | { type: "ALL_PARENTS" }
  | { type: "TEACHERS" }
  | { type: "STAFF" }
  | { type: "GROUP"; groupId: string }
  | { type: "STUDENT"; studentId: string };

/** Resolves a Notification Center audience picker (system.md #22) down to concrete userIds. */
export async function resolveBroadcastTargets(centerId: string, audience: BroadcastAudience): Promise<string[]> {
  switch (audience.type) {
    case "ALL_STUDENTS": {
      const students = await db.student.findMany({ where: { user: { centerId }, status: "ACTIVE" }, select: { userId: true } });
      return students.map((s) => s.userId);
    }
    case "ALL_PARENTS": {
      const parents = await db.parent.findMany({ where: { user: { centerId } }, select: { userId: true } });
      return parents.map((p) => p.userId);
    }
    case "TEACHERS": {
      const teachers = await db.teacher.findMany({ where: { user: { centerId } }, select: { userId: true } });
      return teachers.map((t) => t.userId);
    }
    case "STAFF": {
      const staff = await db.user.findMany({
        where: { centerId, role: { key: { in: ["admin", "assistant"] } } },
        select: { id: true },
      });
      return staff.map((s) => s.id);
    }
    case "GROUP": {
      const memberships = await db.groupStudent.findMany({
        where: { groupId: audience.groupId, status: "ACTIVE" },
        include: { student: true },
      });
      return memberships.map((m) => m.student.userId);
    }
    case "STUDENT": {
      const student = await db.student.findUniqueOrThrow({ where: { id: audience.studentId } });
      return [student.userId];
    }
  }
}
