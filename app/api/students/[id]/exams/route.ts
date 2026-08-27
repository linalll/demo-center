import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";

export const GET = withAuth(async ({ req }) => {
  const studentId = new URL(req.url).pathname.split("/")[3];

  const exams = await db.exam.findMany({
    where: { group: { students: { some: { studentId, status: "ACTIVE" } } } },
    include: { subject: true, results: { where: { studentId } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    exams: exams.map((e) => ({
      id: e.id,
      name: e.name,
      subjectName: e.subject.name,
      totalMarks: e.totalMarks,
      examType: e.examType,
      existingScore: e.results[0]?.score ?? null,
    })),
  });
}, "exams.view");
