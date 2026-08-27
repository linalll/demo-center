import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createOtp, verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { getDefaultCenter, getRoleByKey } from "@/lib/services/center.service";
import { ApiError } from "@/lib/api/handler";
import { ROLE_KEYS } from "@/lib/permissions/definitions";

const PASSWORD_SALT_ROUNDS = 10;

/**
 * Self-registration can create a Parent or a Student account (system.md
 * #6/#34) — Admin/Assistant/Teacher accounts are always provisioned from
 * inside the dashboard by an Admin. Plain phone + password auth — no OTP
 * involved. A self-registered Student still only starts accruing
 * attendance once an Admin enrolls them in a Group (system.md #3).
 */
export async function registerWithPassword(input: {
  phone: string;
  password: string;
  fullName: string;
  role: "PARENT" | "STUDENT";
}) {
  const existing = await db.user.findUnique({ where: { phone: input.phone } });
  if (existing) throw new ApiError(409, "USER_EXISTS", "هذا الرقم مسجل بالفعل، من فضلك سجل الدخول");

  const center = await getDefaultCenter();
  const roleKey = input.role === "STUDENT" ? ROLE_KEYS.STUDENT : ROLE_KEYS.PARENT;
  const role = await getRoleByKey(center.id, roleKey);
  const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        centerId: center.id,
        phone: input.phone,
        fullName: input.fullName,
        passwordHash,
        roleId: role.id,
      },
    });

    if (input.role === "STUDENT") {
      await tx.student.create({
        // Stays INACTIVE until an Admin enrolls them in a Group (system.md #3).
        data: { userId: created.id, studentCode: generateStudentCode(), qrCode: generateQrCode(), status: "INACTIVE" },
      });
    } else {
      await tx.parent.create({ data: { userId: created.id } });
    }

    return created;
  });

  await createSession(user.id);
  return user;
}

export async function loginWithPassword(input: { phone: string; password: string }) {
  const user = await db.user.findUnique({ where: { phone: input.phone } });
  if (!user || !user.passwordHash) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "رقم الهاتف أو كلمة السر غير صحيحة");
  }
  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "ACCOUNT_INACTIVE", "هذا الحساب غير مفعّل، تواصل مع إدارة السنتر");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "رقم الهاتف أو كلمة السر غير صحيحة");
  }

  await createSession(user.id);
  return user;
}

/** system.md #5 — "Forgot / Reset Access", the only place OTP is still used. */
export async function requestPasswordReset(phone: string) {
  const user = await db.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "لا يوجد حساب مسجل بهذا الرقم");

  return createOtp(phone, "RESET", user.id);
}

export async function resetPasswordWithOtp(input: { phone: string; code: string; newPassword: string }) {
  const result = await verifyOtp(input.phone, "RESET", input.code);
  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "لم يتم طلب رمز تحقق لهذا الرقم",
      expired: "انتهت صلاحية رمز التحقق",
      too_many_attempts: "تم تجاوز عدد المحاولات المسموح بها",
      invalid: "رمز التحقق غير صحيح",
    };
    throw new ApiError(400, "OTP_INVALID", messages[result.reason]);
  }

  const user = await db.user.findUnique({ where: { phone: input.phone } });
  if (!user) throw new ApiError(404, "USER_NOT_FOUND");

  const passwordHash = await bcrypt.hash(input.newPassword, PASSWORD_SALT_ROUNDS);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  await createSession(user.id);
  return user;
}

export function generateStudentCode() {
  return `AN-${crypto.randomInt(0, 1_000_000).toString().padStart(6, "0")}`;
}

export function generateQrCode() {
  return crypto.randomBytes(16).toString("hex");
}
