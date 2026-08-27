import { z } from "zod";
import { phoneSchema } from "@/lib/validation/auth";

export const createStudentSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: phoneSchema,
  password: z.string().min(8).max(100),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  school: z.string().max(150).optional(),
  gradeId: z.string().cuid().optional(),
  address: z.string().max(250).optional(),
  guardianName: z.string().max(100).optional(),
  guardianPhone: phoneSchema.optional(),
  parentPhone: phoneSchema.optional(), // links/creates a Parent account
});

export const updateStudentSchema = createStudentSchema.partial().omit({ phone: true });

export const listQuerySchema = z.object({
  q: z.string().optional(),
  gradeId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const bulkStudentActionSchema = z.object({
  studentIds: z.array(z.string().cuid()).min(1),
  action: z.enum(["SUSPEND", "DELETE", "ACTIVATE"]),
});
