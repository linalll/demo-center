import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { AuditLogger } from "@/lib/services/audit.service";

export const GET = withAuth(async ({ user }) => {
  const center = await db.center.findUniqueOrThrow({ where: { id: user.centerId } });
  return NextResponse.json({ center });
}, "settings.manage");

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  workingHours: z.string().optional(),
  currency: z.string().optional(),
  defaultBillingModel: z.enum(["MONTHLY", "PER_SESSION", "CUSTOM"]).optional(),
  gracePeriodMinutes: z.coerce.number().int().min(0).optional(),
  lateAfterMinutes: z.coerce.number().int().min(0).optional(),
  autoAbsenceEnabled: z.boolean().optional(),
  attendanceNotificationsEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
});

export const PATCH = withAuth(async ({ user, req }) => {
  const body = updateSchema.parse(await req.json());
  const center = await db.center.update({ where: { id: user.centerId }, data: body });
  await AuditLogger.log(user, "settings.center_updated", "Center", center.id, body);
  return NextResponse.json({ center });
}, "settings.manage");
