import { NextResponse } from "next/server";
import { withAuth, ApiError } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { startExamAttempt } from "@/lib/services/exam.service";

export const POST = withAuth(async ({ user, req }) => {
  const examId = new URL(req.url).pathname.split("/")[3];
  const student = await db.student.findUnique({ where: { userId: user.id } });
  if (!student) throw new ApiError(403, "NOT_A_STUDENT");

  const attempt = await startExamAttempt(examId, student.id);
  return NextResponse.json({ attempt }, { status: 201 });
});
