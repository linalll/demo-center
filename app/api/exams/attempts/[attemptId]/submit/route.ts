import { NextResponse } from "next/server";
import { withAuth, ApiError } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { submitExamAttempt } from "@/lib/services/exam.service";

export const POST = withAuth(async ({ user, req }) => {
  const attemptId = new URL(req.url).pathname.split("/")[4];
  const student = await db.student.findUnique({ where: { userId: user.id } });
  if (!student) throw new ApiError(403, "NOT_A_STUDENT");

  const attempt = await db.examAttempt.findUniqueOrThrow({ where: { id: attemptId } });
  if (attempt.studentId !== student.id) throw new ApiError(403, "FORBIDDEN");

  const result = await submitExamAttempt(attemptId);
  return NextResponse.json(result);
});
