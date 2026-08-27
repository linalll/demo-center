import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";

export const POST = withAuth(async ({ user, req }) => {
  const id = new URL(req.url).pathname.split("/")[3];
  const notification = await db.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });
  return NextResponse.json({ ok: true, updated: notification.count });
});
