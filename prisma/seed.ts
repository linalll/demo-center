import { PrismaClient } from "@prisma/client";
import { addMonths } from "date-fns";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, ROLE_KEYS } from "../lib/permissions/definitions";

const db = new PrismaClient();

const SEED_PASSWORD = "password123";

function genStudentCode() {
  return `AN-${crypto.randomInt(0, 1_000_000).toString().padStart(6, "0")}`;
}
function genQr() {
  return crypto.randomBytes(16).toString("hex");
}

async function main() {
  console.log("Seeding سنتر أنمكا...");

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

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

  await db.user.create({
    data: { centerId: center.id, phone: "+201000000001", fullName: "مدير السنتر", passwordHash, roleId: roles[ROLE_KEYS.ADMIN].id },
  });

  await db.user.create({
    data: { centerId: center.id, phone: "+201000000002", fullName: "سارة المساعدة", passwordHash, roleId: roles[ROLE_KEYS.ASSISTANT].id },
  });

  const teacherUser = await db.user.create({
    data: { centerId: center.id, phone: "+201000000003", fullName: "أحمد المدرس", passwordHash, roleId: roles[ROLE_KEYS.TEACHER].id },
  });
  const teacher = await db.teacher.create({ data: { userId: teacherUser.id } });

  const stage = await db.stage.create({ data: { centerId: center.id, name: "المرحلة الابتدائية", order: 1 } });
  const grade = await db.grade.create({ data: { stageId: stage.id, name: "الصف الثالث الابتدائي", order: 3 } });

  const subject = await db.subject.create({ data: { centerId: center.id, name: "الرياضيات" } });
  await db.teacher.update({ where: { id: teacher.id }, data: { subjects: { connect: { id: subject.id } } } });

  const classroom = await db.classroom.create({ data: { centerId: center.id, name: "قاعة 1" } });

  const group = await db.group.create({
    data: {
      centerId: center.id,
      name: "Math Grade 3 - Group A",
      subjectId: subject.id,
      teacherId: teacher.id,
      gradeId: grade.id,
      maxStudents: 20,
      price: 300,
      billingModel: "MONTHLY",
      scheduleSlots: {
        create: [
          { dayOfWeek: "SATURDAY", startTime: "17:00", endTime: "18:30", classroomId: classroom.id },
          { dayOfWeek: "MONDAY", startTime: "17:00", endTime: "18:30", classroomId: classroom.id },
          { dayOfWeek: "WEDNESDAY", startTime: "17:00", endTime: "18:30", classroomId: classroom.id },
        ],
      },
    },
    include: { scheduleSlots: true },
  });

  const parentUser = await db.user.create({
    data: { centerId: center.id, phone: "+201000000010", fullName: "ولي أمر محمد", passwordHash, roleId: roles[ROLE_KEYS.PARENT].id },
  });
  const parent = await db.parent.create({ data: { userId: parentUser.id } });

  const studentNames = ["محمد أحمد", "علي حسن", "ياسمين محمود", "نور الدين", "مريم سعيد"];
  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const su = await db.user.create({
      data: {
        centerId: center.id,
        phone: `+20100000002${i}`,
        fullName: studentNames[i],
        passwordHash,
        roleId: roles[ROLE_KEYS.STUDENT].id,
      },
    });
    const student = await db.student.create({
      data: {
        userId: su.id,
        studentCode: genStudentCode(),
        qrCode: genQr(),
        gradeId: grade.id,
        guardianName: "ولي أمر " + studentNames[i],
        guardianPhone: `+20100000003${i}`,
      },
    });
    students.push(student);
    await db.groupStudent.create({ data: { groupId: group.id, studentId: student.id } });
  }

  // link the seeded parent to the first student
  await db.parentStudent.create({ data: { parentId: parent.id, studentId: students[0].id } });

  // Generate sessions for the next month + expected attendance for every enrolled student
  const from = new Date();
  const to = addMonths(from, 1);
  const dayEnumByJsDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dayEnum = dayEnumByJsDay[d.getDay()];
    const slot = group.scheduleSlots.find((s) => s.dayOfWeek === dayEnum);
    if (!slot) continue;

    const session = await db.session.create({
      data: {
        groupId: group.id,
        scheduleSlotId: slot.id,
        date: new Date(d),
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    });

    for (const student of students) {
      await db.expectedAttendance.create({ data: { sessionId: session.id, studentId: student.id } });
    }
  }

  console.log("Seed complete.");
  console.log(`Admin login: +201000000001 / password: ${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
