import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { notifyExamReminder } from "@/lib/services/notification.service";

export const GET = withAuth(async ({ user }) => {
  const exams = await db.exam.findMany({
    where: { centerId: user.centerId },
    include: { subject: true, group: true, teacher: { include: { user: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ exams });
}, "exams.view");

const questionSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"]),
  text: z.string().min(1),
  marks: z.coerce.number().positive().default(1),
  options: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })).optional(),
});

const createExamSchema = z.object({
  name: z.string().min(2),
  subjectId: z.string().cuid(),
  groupId: z.string().cuid(),
  teacherId: z.string().cuid(),
  date: z.coerce.date(),
  durationMinutes: z.coerce.number().int().positive(),
  totalMarks: z.coerce.number().positive(),
  examType: z.enum(["ONLINE", "OFFLINE"]),
  questions: z.array(questionSchema).default([]),
});

export const POST = withAuth(async ({ user, req }) => {
  const body = createExamSchema.parse(await req.json());

  const exam = await db.exam.create({
    data: {
      centerId: user.centerId,
      name: body.name,
      subjectId: body.subjectId,
      groupId: body.groupId,
      teacherId: body.teacherId,
      date: body.date,
      durationMinutes: body.durationMinutes,
      totalMarks: body.totalMarks,
      examType: body.examType,
      createdById: user.id,
      questions: {
        create: body.questions.map((q, i) => ({
          type: q.type,
          text: q.text,
          marks: q.marks,
          order: i,
          options: q.options ? { create: q.options } : undefined,
        })),
      },
    },
    include: { questions: { include: { options: true } } },
  });

  await notifyExamReminder(exam.id).catch((e) => console.error(e));

  return NextResponse.json({ exam }, { status: 201 });
}, "exams.create");
