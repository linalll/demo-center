import { z } from "zod";

export const scheduleSlotSchema = z.object({
  dayOfWeek: z.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  classroomId: z.string().cuid().optional(),
});

export const createGroupSchema = z.object({
  name: z.string().min(2).max(100),
  subjectId: z.string().cuid(),
  teacherId: z.string().cuid(),
  gradeId: z.string().cuid().optional(),
  maxStudents: z.coerce.number().int().min(1).optional(),
  price: z.coerce.number().min(0).default(0),
  billingModel: z.enum(["MONTHLY", "PER_SESSION", "CUSTOM"]).default("MONTHLY"),
  scheduleSlots: z.array(scheduleSlotSchema).min(1),
});

export const addStudentToGroupSchema = z.object({ studentId: z.string().cuid() });
