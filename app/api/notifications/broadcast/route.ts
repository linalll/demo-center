import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { broadcastNotification, resolveBroadcastTargets } from "@/lib/services/notification.service";
import { AuditLogger } from "@/lib/services/audit.service";

const broadcastSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  audience: z.discriminatedUnion("type", [
    z.object({ type: z.literal("ALL_STUDENTS") }),
    z.object({ type: z.literal("ALL_PARENTS") }),
    z.object({ type: z.literal("TEACHERS") }),
    z.object({ type: z.literal("STAFF") }),
    z.object({ type: z.literal("GROUP"), groupId: z.string().cuid() }),
    z.object({ type: z.literal("STUDENT"), studentId: z.string().cuid() }),
  ]),
});

export const POST = withAuth(async ({ user, req }) => {
  const body = broadcastSchema.parse(await req.json());
  const targetUserIds = await resolveBroadcastTargets(user.centerId, body.audience);

  await broadcastNotification({ centerId: user.centerId, title: body.title, body: body.body, targetUserIds });
  await AuditLogger.log(user, "notification.broadcast", "Notification", undefined, {
    audience: body.audience,
    count: targetUserIds.length,
  });

  return NextResponse.json({ ok: true, sentTo: targetUserIds.length }, { status: 201 });
}, "notifications.create");
