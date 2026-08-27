import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";

export const GET = withAuth(async ({ req }) => {
  const id = new URL(req.url).pathname.split("/")[3];
  const exam = await db.exam.findUniqueOrThrow({
    where: { id },
    include: {
      subject: true,
      group: true,
      teacher: { include: { user: true } },
      questions: { orderBy: { order: "asc" }, include: { options: true } },
      results: { include: { student: { include: { user: true } } }, orderBy: { score: "desc" } },
    },
  });
  return NextResponse.json({ exam });
}, "exams.view");
