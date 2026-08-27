import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions/check";
import type { CurrentUser } from "@/lib/auth/session";
import { ROLE_KEYS } from "@/lib/permissions/definitions";

/**
 * Staff with students.view can see anyone; a Student can only see their own
 * record; a Parent can only see their linked children (system.md #6/#43 —
 * "Permission Checks على Backend وليس Frontend فقط"). Used by student
 * profile/receipt/ID-card pages, which are reachable by direct URL.
 */
export async function canAccessStudent(user: CurrentUser, studentId: string): Promise<boolean> {
  if (hasPermission(user, "students.view")) return true;

  if (user.role.key === ROLE_KEYS.STUDENT) {
    const student = await db.student.findUnique({ where: { userId: user.id } });
    return student?.id === studentId;
  }

  if (user.role.key === ROLE_KEYS.PARENT) {
    const parent = await db.parent.findUnique({ where: { userId: user.id } });
    if (!parent) return false;
    const link = await db.parentStudent.findUnique({
      where: { parentId_studentId: { parentId: parent.id, studentId } },
    });
    return !!link;
  }

  return false;
}
