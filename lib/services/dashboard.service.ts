import { startOfDay, endOfDay, startOfMonth } from "date-fns";
import { db } from "@/lib/db";
import { getCenterFinancialSummary } from "@/lib/services/finance.service";

export async function getAdminDashboardStats(centerId: string) {
  const today = new Date();
  const todayRange = { gte: startOfDay(today), lte: endOfDay(today) };

  const [
    totalStudents,
    totalTeachers,
    totalGroups,
    sessionsToday,
    attendanceToday,
    upcomingExams,
    financial,
  ] = await Promise.all([
    db.student.count({ where: { user: { centerId }, status: "ACTIVE" } }),
    db.teacher.count({ where: { user: { centerId }, status: "ACTIVE" } }),
    db.group.count({ where: { centerId, status: "ACTIVE" } }),
    db.session.count({ where: { date: todayRange, group: { centerId } } }),
    db.attendance.groupBy({
      by: ["status"],
      where: { session: { date: todayRange, group: { centerId } } },
      _count: true,
    }),
    db.exam.count({ where: { centerId, date: { gte: today } } }),
    getCenterFinancialSummary(centerId, startOfMonth(today), today),
  ]);

  const presentToday = attendanceToday.find((a) => a.status === "PRESENT")?._count ?? 0;
  const lateToday = attendanceToday.find((a) => a.status === "LATE")?._count ?? 0;
  const absentToday = attendanceToday.find((a) => a.status === "ABSENT")?._count ?? 0;

  return {
    totalStudents,
    totalTeachers,
    totalGroups,
    sessionsToday,
    presentToday,
    lateToday,
    absentToday,
    upcomingExams,
    financial,
  };
}

export async function getTeacherDashboardData(teacherUserId: string) {
  const teacher = await db.teacher.findUniqueOrThrow({ where: { userId: teacherUserId } });
  const today = new Date();
  const todayRange = { gte: startOfDay(today), lte: endOfDay(today) };

  const [sessionsToday, groups, upcomingExams] = await Promise.all([
    db.session.findMany({
      where: { date: todayRange, group: { teacherId: teacher.id } },
      include: { group: { include: { subject: true } }, _count: { select: { expectedAttendances: true, attendances: true } } },
      orderBy: { startTime: "asc" },
    }),
    db.group.count({ where: { teacherId: teacher.id, status: "ACTIVE" } }),
    db.exam.findMany({
      where: { teacherId: teacher.id, date: { gte: today } },
      include: { subject: true, group: true },
      orderBy: { date: "asc" },
      take: 5,
    }),
  ]);

  return { sessionsToday, groups, upcomingExams };
}

export async function getStudentDashboardData(studentUserId: string) {
  const student = await db.student.findUniqueOrThrow({ where: { userId: studentUserId } });
  const today = new Date();

  const [nextSessions, upcomingExams, balance, recentAttendance] = await Promise.all([
    db.session.findMany({
      where: { date: { gte: startOfDay(today) }, group: { students: { some: { studentId: student.id, status: "ACTIVE" } } } },
      include: { group: { include: { subject: true } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
    db.exam.findMany({
      where: { date: { gte: today }, group: { students: { some: { studentId: student.id, status: "ACTIVE" } } } },
      include: { subject: true },
      orderBy: { date: "asc" },
      take: 5,
    }),
    import("@/lib/services/finance.service").then((m) => m.getStudentBalance(student.id)),
    db.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { session: { include: { group: { include: { subject: true } } } } },
    }),
  ]);

  return { student, nextSessions, upcomingExams, balance, recentAttendance };
}

export async function getParentChildren(parentUserId: string) {
  const parent = await db.parent.findUniqueOrThrow({ where: { userId: parentUserId } });
  const links = await db.parentStudent.findMany({
    where: { parentId: parent.id },
    include: { student: { include: { user: true } } },
  });
  return links.map((l) => l.student);
}
