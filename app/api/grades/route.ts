import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";

export const GET = withAuth(async ({ user }) => {
  const grades = await db.grade.findMany({
    where: { stage: { centerId: user.centerId } },
    include: { stage: true },
    orderBy: [{ stage: { order: "asc" } }, { order: "asc" }],
  });
  return NextResponse.json({ grades });
});
