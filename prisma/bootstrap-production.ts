// One-time production bootstrap: Center + Roles/Permissions + a single real
// Admin account. Deliberately contains none of prisma/seed.ts's fake demo
// data (students, groups, sessions) — this is for a real, live center.
//
// Usage: ADMIN_PHONE=+201234567890 ADMIN_NAME="اسم المدير" ADMIN_PASSWORD=... npx tsx prisma/bootstrap-production.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, ROLE_KEYS } from "../lib/permissions/definitions";

const db = new PrismaClient();

async function main() {
  const phone = process.env.ADMIN_PHONE;
  const fullName = process.env.ADMIN_NAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!phone || !fullName || !password) {
    throw new Error("ADMIN_PHONE, ADMIN_NAME and ADMIN_PASSWORD env vars are required");
  }

  const existingCenter = await db.center.findFirst();
  if (existingCenter) {
    console.log("Center already bootstrapped — skipping. Delete the Center row first if you want to re-run.");
    return;
  }

  console.log("Bootstrapping سنتر أنمكا (production)...");

  const center = await db.center.create({
    data: { name: "سنتر أنمكا", nameEn: "ANMKA Center", whatsappEnabled: false },
  });

  const roleNames: Record<string, string> = {
    [ROLE_KEYS.ADMIN]: "مدير",
    [ROLE_KEYS.ASSISTANT]: "موظف السنتر",
    [ROLE_KEYS.TEACHER]: "مدرس",
    [ROLE_KEYS.STUDENT]: "طالب",
    [ROLE_KEYS.PARENT]: "ولي أمر",
  };

  const roles: Record<string, { id: string }> = {};
  for (const key of Object.values(ROLE_KEYS)) {
    roles[key] = await db.role.create({ data: { centerId: center.id, key, name: roleNames[key], isSystem: true } });
  }

  for (const key of ALL_PERMISSIONS) {
    await db.permission.upsert({ where: { key }, update: {}, create: { key, group: key.split(".")[0] } });
  }

  for (const [roleKey, permissionKeys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const permissionKey of permissionKeys) {
      const permission = await db.permission.findUniqueOrThrow({ where: { key: permissionKey } });
      await db.rolePermission.create({ data: { roleId: roles[roleKey].id, permissionId: permission.id } });
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await db.user.create({
    data: { centerId: center.id, phone, fullName, passwordHash, roleId: roles[ROLE_KEYS.ADMIN].id },
  });

  console.log(`Bootstrap complete. Admin user: ${admin.phone}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
