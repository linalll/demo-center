import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { closeSessionAndMarkAbsences } from "@/lib/services/attendance.service";
import { AuditLogger } from "@/lib/services/audit.service";

export const POST = withAuth(async ({ user, req }) => {
  const sessionId = new URL(req.url).pathname.split("/")[4];
  await closeSessionAndMarkAbsences(sessionId);
  await AuditLogger.log(user, "session.close", "Session", sessionId);
  return NextResponse.json({ ok: true });
}, "attendance.edit");
