import { NextResponse } from "next/server";
import { withAuth, ApiError } from "@/lib/api/handler";
import { db } from "@/lib/db";

// Student-facing view: never exposes isCorrect flags or other students' data
// — separate from the admin/teacher /api/exams/[id] route on purpose.
export const GET = withAuth(async ({ user, req }) => {
  const examId = new URL(req.url).pathname.split("/")[3];

  const student = await db.student.findUnique({ where: { userId: user.id } });
  if (!student) throw new ApiError(403, "NOT_A_STUDENT");

  const exam = await db.exam.findUniqueOrThrow({
    where: { id: examId },
    include: {
      subject: true,
      group: true,
      questions: {
        orderBy: { order: "asc" },
        include: { options: { select: { id: true, text: true } } },
      },
    },
  });

  const attempt = await db.examAttempt.findUnique({
    where: { examId_studentId: { examId, studentId: student.id } },
    include: { answers: true },
  });

  const result = await db.examResult.findUnique({ where: { examId_studentId: { examId, studentId: student.id } } });

  return NextResponse.json({ exam, attempt, result });
});
