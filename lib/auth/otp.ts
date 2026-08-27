import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { OtpPurpose } from "@prisma/client";

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES ?? 5);
const MAX_ATTEMPTS = 5;

function generateNumericCode(length = 6) {
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(length, "0");
}

/**
 * Creates and persists a new OTP code for a phone number.
 * In development (no SMS provider configured) the code is also returned so it
 * can be surfaced to the caller; a real SMS provider integration point is
 * `sendOtpSms` below, which is a no-op today by design (see system.md #5, #21).
 */
export async function createOtp(phone: string, purpose: OtpPurpose, userId?: string) {
  const code = process.env.OTP_DEV_STATIC_CODE || generateNumericCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await db.otpCode.create({
    data: { phone, purpose, codeHash, expiresAt, userId },
  });

  await sendOtpSms(phone, code);

  return { code, expiresAt };
}

export async function verifyOtp(phone: string, purpose: OtpPurpose, code: string) {
  const otp = await db.otpCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { ok: false as const, reason: "not_found" as const };
  if (otp.expiresAt < new Date()) return { ok: false as const, reason: "expired" as const };
  if (otp.attempts >= MAX_ATTEMPTS) return { ok: false as const, reason: "too_many_attempts" as const };

  const valid = await bcrypt.compare(code, otp.codeHash);
  if (!valid) {
    await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { ok: false as const, reason: "invalid" as const };
  }

  await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return { ok: true as const };
}

// Hardware/provider integration point — swap this for a real WhatsApp/SMS
// OTP provider without touching any auth flow code (system.md #5: "جهز
// النظام بحيث يمكن ربط OTP بمزود SMS مستقبلًا").
async function sendOtpSms(phone: string, code: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[OTP] ${phone} -> ${code}`);
  }
  // TODO: integrate SMS/WhatsApp OTP provider here.
}
