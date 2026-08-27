import { db } from "@/lib/db";

/** system.md #32 — Attendance Reports: نسبة الحضور، أكثر الطلاب غيابًا. */
export async function getAttendanceReport(centerId: string, from?: Date, to?: Date) {
  const dateFilter = from || to ? { date: { gte: from, lte: to } } : {};

  const students = await db.student.findMany({
    where: { user: { centerId }, status: "ACTIVE" },
    include: { user: true },
  });

  const rows = await Promise.all(
    students.map(async (s) => {
      const attendances = await db.attendance.findMany({
        where: { studentId: s.id, session: dateFilter },
        select: { status: true },
      });
      const present = attendances.filter((a) => a.status === "PRESENT").length;
      const late = attendances.filter((a) => a.status === "LATE").length;
      const absent = attendances.filter((a) => a.status === "ABSENT").length;
      const total = attendances.length;
      return {
        student: s,
        present,
        late,
        absent,
        total,
        attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
      };
    }),
  );

  return rows.sort((a, b) => b.absent - a.absent);
}

/** system.md #32 — Exam Reports: متوسط النتائج، أعلى/أقل الدرجات لكل مجموعة/مادة. */
export async function getExamReport(centerId: string) {
  const exams = await db.exam.findMany({
    where: { centerId },
    include: { subject: true, group: true, results: true },
    orderBy: { date: "desc" },
  });

  return exams.map((e) => {
    const scores = e.results.map((r) => Number(r.score));
    const avg = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    return {
      exam: e,
      resultsCount: scores.length,
      average: Math.round(avg * 10) / 10,
      highest: scores.length ? Math.max(...scores) : 0,
      lowest: scores.length ? Math.min(...scores) : 0,
    };
  });
}

/** system.md #32 — Teacher Reports: عدد الحصص، عدد الطلاب، مجموعاته. */
export async function getTeacherReport(centerId: string) {
  const teachers = await db.teacher.findMany({
    where: { user: { centerId } },
    include: {
      user: true,
      groups: { include: { _count: { select: { students: true, sessions: true } } } },
    },
  });

  return teachers.map((t) => ({
    teacher: t,
    groupsCount: t.groups.length,
    studentsCount: t.groups.reduce((sum, g) => sum + g._count.students, 0),
    sessionsCount: t.groups.reduce((sum, g) => sum + g._count.sessions, 0),
  }));
}
