import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { createStudentSchema, listQuerySchema } from "@/lib/validation/student";
import { createStudent, listStudents } from "@/lib/services/student.service";
import { db } from "@/lib/db";
import { AuditLogger } from "@/lib/services/audit.service";

export const GET = withAuth(async ({ user, req }) => {
  const url = new URL(req.url);
  const query = listQuerySchema.parse(Object.fromEntries(url.searchParams));
  const result = await listStudents(user.centerId, query);
  return NextResponse.json(result);
}, "students.view");

export const POST = withAuth(async ({ user, req }) => {
  const body = createStudentSchema.parse(await req.json());
  const student = await createStudent(user.centerId, body);
  await AuditLogger.log(user, "student.create", "Student", student.id, { fullName: body.fullName });
  const full = await db.student.findUnique({ where: { id: student.id }, include: { user: true } });
  return NextResponse.json({ student: full }, { status: 201 });
}, "students.create");
