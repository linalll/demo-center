import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { markManualAttendance } from "@/lib/services/attendance.service";
import { AuditLogger } from "@/lib/services/audit.service";

const manualSchema = z.object({
  sessionId: z.string().cuid(),
  studentId: z.string().cuid(),
  status: z.enum(["PRESENT", "LATE", "ABSENT"]),
});

export const POST = withAuth(async ({ user, req }) => {
  const body = manualSchema.parse(await req.json());
  const attendance = await markManualAttendance({ ...body, recordedById: user.id });
  await AuditLogger.log(user, "attendance.manual_override", "Attendance", attendance.id, body);
  return NextResponse.json({ attendance }, { status: 201 });
}, "attendance.edit");
