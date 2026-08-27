import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { createGroupSchema } from "@/lib/validation/group";
import { createGroup, listGroups } from "@/lib/services/group.service";
import { AuditLogger } from "@/lib/services/audit.service";

export const GET = withAuth(async ({ user }) => {
  const groups = await listGroups(user.centerId);
  return NextResponse.json({ groups });
}, "groups.view");

export const POST = withAuth(async ({ user, req }) => {
  const body = createGroupSchema.parse(await req.json());
  const group = await createGroup(user.centerId, body);
  await AuditLogger.log(user, "group.create", "Group", group.id, { name: body.name });
  return NextResponse.json({ group }, { status: 201 });
}, "groups.create");
