import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api/handler";
import { getRoleByKey } from "@/lib/services/center.service";
import { ROLE_KEYS } from "@/lib/permissions/definitions";
import { generateQrCode, generateStudentCode } from "@/lib/services/auth.service";
import type { z } from "zod";
import type { createStudentSchema, listQuerySchema } from "@/lib/validation/student";

type CreateStudentInput = z.infer<typeof createStudentSchema>;
type ListQuery = z.infer<typeof listQuerySchema>;

export async function createStudent(centerId: string, input: CreateStudentInput) {
  const existingPhone = await db.user.findUnique({ where: { phone: input.phone } });
  if (existingPhone) throw new ApiError(409, "PHONE_EXISTS", "رقم الهاتف مستخدم بالفعل");

  const studentRole = await getRoleByKey(centerId, ROLE_KEYS.STUDENT);
  const passwordHash = await bcrypt.hash(input.password, 10);

  const student = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        centerId,
        phone: input.phone,
        fullName: input.fullName,
        passwordHash,
        roleId: studentRole.id,
      },
    });

    const created = await tx.student.create({
      data: {
        userId: user.id,
        studentCode: generateStudentCode(),
        qrCode: generateQrCode(),
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        school: input.school,
        gradeId: input.gradeId,
        address: input.address,
        guardianName: input.guardianName,
        guardianPhone: input.guardianPhone,
        // Stays INACTIVE until enrolled in a group (activateStudentIfNeeded in
        // group.service.ts flips this once membership actually starts).
        status: "INACTIVE",
      },
    });

    if (input.parentPhone) {
      const parentRole = await getRoleByKey(centerId, ROLE_KEYS.PARENT);
      let parentUser = await tx.user.findUnique({ where: { phone: input.parentPhone }, include: { parent: true } });

      if (!parentUser) {
        parentUser = await tx.user.create({
          data: {
            centerId,
            phone: input.parentPhone,
            fullName: input.guardianName || "ولي الأمر",
            roleId: parentRole.id,
          },
          include: { parent: true },
        });
      }

      let parent = parentUser.parent;
      if (!parent) {
        parent = await tx.parent.create({ data: { userId: parentUser.id } });
      }

      await tx.parentStudent.create({ data: { parentId: parent.id, studentId: created.id } });
    }

    return created;
  });

  return student;
}

export async function listStudents(centerId: string, query: ListQuery) {
  const where = {
    user: { centerId },
    ...(query.gradeId ? { gradeId: query.gradeId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { user: { fullName: { contains: query.q, mode: "insensitive" as const } } },
            { user: { phone: { contains: query.q } } },
            { studentCode: { contains: query.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.student.findMany({
      where,
      include: { user: true, grade: { include: { stage: true } } },
      orderBy: { enrollmentDate: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    db.student.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

/**
 * Applies a status change to a batch of students at once (system.md #9's
 * "حذف / تعطيل طالب", extended to bulk selection). DELETE/SUSPEND also lock
 * the linked User out of login — both touch Student.status (drives lists/
 * attendance eligibility) and User.status (drives auth).
 */
export async function bulkUpdateStudents(centerId: string, studentIds: string[], action: "SUSPEND" | "DELETE" | "ACTIVATE") {
  const students = await db.student.findMany({
    where: { id: { in: studentIds }, user: { centerId } },
    select: { id: true, userId: true },
  });
  if (students.length === 0) return { count: 0 };

  const studentStatus = action === "ACTIVATE" ? "ACTIVE" : "INACTIVE";
  const userStatus = action === "SUSPEND" ? "SUSPENDED" : action === "DELETE" ? "INACTIVE" : "ACTIVE";

  const ids = students.map((s) => s.id);
  const userIds = students.map((s) => s.userId);

  await db.$transaction([
    db.student.updateMany({ where: { id: { in: ids } }, data: { status: studentStatus } }),
    db.user.updateMany({ where: { id: { in: userIds } }, data: { status: userStatus } }),
  ]);

  return { count: students.length };
}

export async function getStudentProfile(studentId: string) {
  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      grade: { include: { stage: true } },
      groupMemberships: {
        include: { group: { include: { subject: true, teacher: { include: { user: true } }, scheduleSlots: true } } },
      },
      nfcCards: true,
      parents: { include: { parent: { include: { user: true } } } },
    },
  });
  if (!student) throw new ApiError(404, "STUDENT_NOT_FOUND");
  return student;
}
