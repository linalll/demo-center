import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { bulkStudentActionSchema } from "@/lib/validation/student";
import { bulkUpdateStudents } from "@/lib/services/student.service";
import { AuditLogger } from "@/lib/services/audit.service";

export const POST = withAuth(async ({ user, req }) => {
  const body = bulkStudentActionSchema.parse(await req.json());
  const result = await bulkUpdateStudents(user.centerId, body.studentIds, body.action);
  await AuditLogger.log(user, `student.bulk_${body.action.toLowerCase()}`, "Student", undefined, {
    studentIds: body.studentIds,
  });
  return NextResponse.json(result);
}, "students.delete");
