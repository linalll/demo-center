import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { addStudentToGroupSchema } from "@/lib/validation/group";
import { addStudentToGroup } from "@/lib/services/group.service";
import { AuditLogger } from "@/lib/services/audit.service";

export const POST = withAuth(async ({ user, req }) => {
  const groupId = new URL(req.url).pathname.split("/")[3];
  const body = addStudentToGroupSchema.parse(await req.json());
  const membership = await addStudentToGroup(groupId, body.studentId);
  await AuditLogger.log(user, "group.add_student", "Group", groupId, { studentId: body.studentId });
  return NextResponse.json({ membership }, { status: 201 });
}, "groups.edit");
