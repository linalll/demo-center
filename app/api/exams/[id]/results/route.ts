import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { recordOfflineResult } from "@/lib/services/exam.service";
import { db } from "@/lib/db";
import { AuditLogger } from "@/lib/services/audit.service";

const resultSchema = z.object({ studentId: z.string().cuid(), score: z.coerce.number().min(0) });

export const POST = withAuth(async ({ user, req }) => {
  const examId = new URL(req.url).pathname.split("/")[3];
  const body = resultSchema.parse(await req.json());

  const result = await recordOfflineResult({ examId, ...body, gradedById: user.id });
  await AuditLogger.log(user, "exam.result_recorded", "ExamResult", result.id, body);
  return NextResponse.json({ result }, { status: 201 });
}, "exams.grade");

export const GET = withAuth(async ({ req }) => {
  const examId = new URL(req.url).pathname.split("/")[3];
  const results = await db.examResult.findMany({
    where: { examId },
    include: { student: { include: { user: true } } },
    orderBy: { score: "desc" },
  });
  return NextResponse.json({ results });
}, "exams.view");
