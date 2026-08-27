import { z } from "zod";

// Accepts international format e.g. +201012345678
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{8,15}$/, "رقم الهاتف غير صحيح");

const passwordSchema = z.string().min(8, "كلمة السر يجب أن تكون 8 أحرف على الأقل").max(100);

// Self-registration is limited to Parent or Student — staff accounts
// (Admin/Assistant/Teacher) are always provisioned by an Admin (system.md #6).
export const registerSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  fullName: z.string().min(2).max(100),
  role: z.enum(["PARENT", "STUDENT"]).default("PARENT"),
});

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "كلمة السر مطلوبة"),
});

export const forgotPasswordSchema = z.object({
  phone: phoneSchema,
});

export const resetPasswordSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6),
  newPassword: passwordSchema,
});
