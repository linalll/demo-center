import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api/handler";
import { getRoleByKey } from "@/lib/services/center.service";

export async function listCenterUsers(centerId: string) {
  return db.user.findMany({
    where: { centerId },
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
}

/** system.md #7 — creates an Assistant with a hand-picked set of permission overrides. */
export async function createAssistant(
  centerId: string,
  input: { fullName: string; phone: string; password: string; permissionKeys: string[] },
) {
  const existing = await db.user.findUnique({ where: { phone: input.phone } });
  if (existing) throw new ApiError(409, "PHONE_EXISTS", "رقم الهاتف مستخدم بالفعل");

  const role = await getRoleByKey(centerId, "assistant");
  const passwordHash = await bcrypt.hash(input.password, 10);

  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { centerId, phone: input.phone, fullName: input.fullName, passwordHash, roleId: role.id },
    });

    for (const key of input.permissionKeys) {
      const permission = await tx.permission.findUnique({ where: { key } });
      if (!permission) continue;
      await tx.userPermission.create({ data: { userId: user.id, permissionId: permission.id, granted: true } });
    }

    return user;
  });
}

/** Replaces a user's permission overrides wholesale — simplest mental model for an Admin editing a single Assistant. */
export async function setUserPermissionOverrides(userId: string, permissionKeys: string[]) {
  await db.userPermission.deleteMany({ where: { userId } });

  for (const key of permissionKeys) {
    const permission = await db.permission.findUnique({ where: { key } });
    if (!permission) continue;
    await db.userPermission.create({ data: { userId, permissionId: permission.id, granted: true } });
  }

  return db.user.findUniqueOrThrow({ where: { id: userId }, include: { permissionOverrides: { include: { permission: true } } } });
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") {
  return db.user.update({ where: { id: userId }, data: { status } });
}
