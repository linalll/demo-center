import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getSessionRoster } from "@/lib/services/attendance.service";

export const GET = withAuth(async ({ req }) => {
  const sessionId = new URL(req.url).pathname.split("/")[4];
  const roster = await getSessionRoster(sessionId);
  return NextResponse.json(roster);
}, "attendance.view");
