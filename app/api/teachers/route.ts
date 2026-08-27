import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { getRoleByKey } from "@/lib/services/center.service";
import { ROLE_KEYS } from "@/lib/permissions/definitions";
import { phoneSchema } from "@/lib/validation/auth";
import { ApiError } from "@/lib/api/handler";

export const GET = withAuth(async ({ user }) => {
  const teachers = await db.teacher.findMany({
    where: { user: { centerId: user.centerId } },
    include: { user: true, subjects: true },
    orderBy: { user: { fullName: "asc" } },
  });
  return NextResponse.json({ teachers });
}, "teachers.view");

const createSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: phoneSchema,
  subjectIds: z.array(z.string().cuid()).default([]),
});

// No password is set here — the teacher activates their own login later via
// "نسيت كلمة السر" (system.md #5's reset flow), same pattern as an
// auto-created Parent account when a Student is registered with a parentPhone.
export const POST = withAuth(async ({ user, req }) => {
  const body = createSchema.parse(await req.json());

  const existing = await db.user.findUnique({ where: { phone: body.phone } });
  if (existing) throw new ApiError(409, "PHONE_EXISTS", "رقم الهاتف مستخدم بالفعل");

  const role = await getRoleByKey(user.centerId, ROLE_KEYS.TEACHER);

  const teacher = await db.$transaction(async (tx) => {
    const teacherUser = await tx.user.create({
      data: { centerId: user.centerId, phone: body.phone, fullName: body.fullName, roleId: role.id },
    });
    return tx.teacher.create({
      data: {
        userId: teacherUser.id,
        subjects: { connect: body.subjectIds.map((id) => ({ id })) },
      },
      include: { user: true, subjects: true },
    });
  });

  return NextResponse.json({ teacher }, { status: 201 });
}, "teachers.create");
