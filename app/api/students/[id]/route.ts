import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { updateStudentSchema } from "@/lib/validation/student";
import { getStudentProfile } from "@/lib/services/student.service";
import { db } from "@/lib/db";
import { AuditLogger } from "@/lib/services/audit.service";

export const GET = withAuth(async ({ req }) => {
  const id = new URL(req.url).pathname.split("/").pop()!;
  const student = await getStudentProfile(id);
  return NextResponse.json({ student });
}, "students.view");

export const PATCH = withAuth(async ({ user, req }) => {
  const id = new URL(req.url).pathname.split("/").pop()!;
  const body = updateStudentSchema.parse(await req.json());

  const student = await db.student.update({
    where: { id },
    data: body,
    include: { user: true },
  });

  await AuditLogger.log(user, "student.edit", "Student", id, body);
  return NextResponse.json({ student });
}, "students.edit");

export const DELETE = withAuth(async ({ user, req }) => {
  const id = new URL(req.url).pathname.split("/").pop()!;
  const student = await db.student.update({ where: { id }, data: { status: "INACTIVE" } });
  await AuditLogger.log(user, "student.delete", "Student", id);
  return NextResponse.json({ student });
}, "students.delete");
