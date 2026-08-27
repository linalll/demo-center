import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";

export const GET = withAuth(async ({ user, req }) => {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  const sessions = await db.session.findMany({
    where: {
      date: { gte: startOfDay(date), lte: endOfDay(date) },
      group: { centerId: user.centerId },
    },
    include: {
      group: { include: { subject: true, teacher: { include: { user: true } } } },
      _count: { select: { expectedAttendances: true, attendances: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({ sessions });
}, "attendance.view");
