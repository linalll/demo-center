import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth, ApiError } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { saveAnswer } from "@/lib/services/exam.service";

const answerSchema = z.object({
  questionId: z.string().cuid(),
  answerText: z.string().optional(),
  selectedOptionId: z.string().cuid().optional(),
});

export const POST = withAuth(async ({ user, req }) => {
  const attemptId = new URL(req.url).pathname.split("/")[4];
  const student = await db.student.findUnique({ where: { userId: user.id } });
  if (!student) throw new ApiError(403, "NOT_A_STUDENT");

  const attempt = await db.examAttempt.findUniqueOrThrow({ where: { id: attemptId } });
  if (attempt.studentId !== student.id) throw new ApiError(403, "FORBIDDEN");

  const body = answerSchema.parse(await req.json());
  const answer = await saveAnswer({ attemptId, ...body });
  return NextResponse.json({ answer });
});
