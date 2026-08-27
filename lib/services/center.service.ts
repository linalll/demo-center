import { db } from "@/lib/db";
import { DEFAULT_ROLE_PERMISSIONS, ROLE_KEYS } from "@/lib/permissions/definitions";

/**
 * The app is single-center today but the schema is multi-tenant-ready
 * (system.md #63: "نظام SaaS كامل لإدارة السناتر"). Until a center picker
 * exists in the UI, everything hangs off the one bootstrap center.
 */
export async function getDefaultCenter() {
  const existing = await db.center.findFirst();
  if (existing) return existing;

  const center = await db.center.create({ data: {} });

  for (const key of Object.values(ROLE_KEYS)) {
    await db.role.create({
      data: {
        centerId: center.id,
        key,
        name: ROLE_NAMES_AR[key],
        isSystem: true,
      },
    });
  }

  await syncRolePermissions(center.id);

  return center;
}

const ROLE_NAMES_AR: Record<string, string> = {
  [ROLE_KEYS.ADMIN]: "مدير",
  [ROLE_KEYS.ASSISTANT]: "موظف السنتر",
  [ROLE_KEYS.TEACHER]: "مدرس",
  [ROLE_KEYS.STUDENT]: "طالب",
  [ROLE_KEYS.PARENT]: "ولي أمر",
};

export async function syncRolePermissions(centerId: string) {
  const { ALL_PERMISSIONS } = await import("@/lib/permissions/definitions");
  for (const key of ALL_PERMISSIONS) {
    await db.permission.upsert({
      where: { key },
      update: {},
      create: { key, group: key.split(".")[0] },
    });
  }

  for (const [roleKey, permissionKeys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = await db.role.findUnique({ where: { centerId_key: { centerId, key: roleKey } } });
    if (!role) continue;
    for (const permissionKey of permissionKeys) {
      const permission = await db.permission.findUnique({ where: { key: permissionKey } });
      if (!permission) continue;
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
}

export async function getRoleByKey(centerId: string, key: string) {
  const role = await db.role.findUnique({ where: { centerId_key: { centerId, key } } });
  if (!role) throw new Error(`Role not seeded: ${key}`);
  return role;
}
