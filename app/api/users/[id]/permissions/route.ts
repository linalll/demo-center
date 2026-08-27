import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { setUserPermissionOverrides } from "@/lib/services/user.service";
import { AuditLogger } from "@/lib/services/audit.service";

const schema = z.object({ permissionKeys: z.array(z.string()) });

export const PUT = withAuth(async ({ user, req }) => {
  const targetUserId = new URL(req.url).pathname.split("/")[3];
  const body = schema.parse(await req.json());

  const updated = await setUserPermissionOverrides(targetUserId, body.permissionKeys);
  await AuditLogger.log(user, "user.permissions_updated", "User", targetUserId, body);

  return NextResponse.json({ user: updated });
}, "users.manage");
