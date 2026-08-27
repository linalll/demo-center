import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";

export const GET = withAuth(async ({ user }) => {
  const stages = await db.stage.findMany({
    where: { centerId: user.centerId },
    include: { grades: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ stages });
}, "subjects.view");

const createSchema = z.object({ name: z.string().min(1) });

export const POST = withAuth(async ({ user, req }) => {
  const body = createSchema.parse(await req.json());
  const count = await db.stage.count({ where: { centerId: user.centerId } });
  const stage = await db.stage.create({ data: { centerId: user.centerId, name: body.name, order: count } });
  return NextResponse.json({ stage }, { status: 201 });
}, "subjects.create");
