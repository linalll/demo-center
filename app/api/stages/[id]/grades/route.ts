import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";

const createSchema = z.object({ name: z.string().min(1) });

export const POST = withAuth(async ({ req }) => {
  const stageId = new URL(req.url).pathname.split("/")[3];
  const body = createSchema.parse(await req.json());
  const count = await db.grade.count({ where: { stageId } });
  const grade = await db.grade.create({ data: { stageId, name: body.name, order: count } });
  return NextResponse.json({ grade }, { status: 201 });
}, "subjects.create");
