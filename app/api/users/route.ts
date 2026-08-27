import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { listCenterUsers, createAssistant } from "@/lib/services/user.service";
import { phoneSchema } from "@/lib/validation/auth";
import { AuditLogger } from "@/lib/services/audit.service";

export const GET = withAuth(async ({ user }) => {
  const users = await listCenterUsers(user.centerId);
  return NextResponse.json({ users });
}, "users.manage");

const createSchema = z.object({
  fullName: z.string().min(2),
  phone: phoneSchema,
  password: z.string().min(8).max(100),
  permissionKeys: z.array(z.string()).default([]),
});

export const POST = withAuth(async ({ user, req }) => {
  const body = createSchema.parse(await req.json());
  const created = await createAssistant(user.centerId, body);
  await AuditLogger.log(user, "user.create_assistant", "User", created.id, { permissionKeys: body.permissionKeys });
  return NextResponse.json({ user: created }, { status: 201 });
}, "users.manage");
