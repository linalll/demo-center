import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { updateUserStatus } from "@/lib/services/user.service";
import { AuditLogger } from "@/lib/services/audit.service";

const schema = z.object({ status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]) });

export const PATCH = withAuth(async ({ user, req }) => {
  const targetUserId = new URL(req.url).pathname.split("/")[3];
  const body = schema.parse(await req.json());

  const updated = await updateUserStatus(targetUserId, body.status);
  await AuditLogger.log(user, "user.status_updated", "User", targetUserId, body);

  return NextResponse.json({ user: updated });
}, "users.manage");
