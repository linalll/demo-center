import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";

export const GET = withAuth(async ({ user }) => {
  const subjects = await db.subject.findMany({ where: { centerId: user.centerId }, orderBy: { name: "asc" } });
  return NextResponse.json({ subjects });
}, "subjects.view");

const createSchema = z.object({ name: z.string().min(2).max(100), courseId: z.string().cuid().optional() });

export const POST = withAuth(async ({ user, req }) => {
  const body = createSchema.parse(await req.json());
  const subject = await db.subject.create({ data: { centerId: user.centerId, ...body } });
  return NextResponse.json({ subject }, { status: 201 });
}, "subjects.create");
