// Create or update an admin user on an existing center.
//
// Usage:
//   ADMIN_PHONE=+201201922224 ADMIN_NAME="مدير السنتر" ADMIN_PASSWORD=... npx tsx prisma/create-admin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const phone = process.env.ADMIN_PHONE;
  const fullName = process.env.ADMIN_NAME ?? "مدير السنتر";
  const password = process.env.ADMIN_PASSWORD;
  if (!phone || !password) {
    throw new Error("ADMIN_PHONE and ADMIN_PASSWORD env vars are required");
  }

  const center = await db.center.findFirst();
  if (!center) {
    throw new Error("No center found — run bootstrap-production.ts first");
  }

  const role = await db.role.findUniqueOrThrow({
    where: { centerId_key: { centerId: center.id, key: "admin" } },
  });

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await db.user.findUnique({ where: { phone } });

  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: { passwordHash, roleId: role.id, status: "ACTIVE", fullName },
    });
    console.log(`Updated admin: ${phone}`);
    return;
  }

  await db.user.create({
    data: { centerId: center.id, phone, fullName, passwordHash, roleId: role.id, status: "ACTIVE" },
  });
  console.log(`Created admin: ${phone}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
