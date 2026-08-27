import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { checkInStudent } from "@/lib/services/attendance.service";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api/handler";

// Resolves either a QR code payload or an NFC card UID down to a studentId
// before handing off to the shared check-in flow (system.md #15/#16).
const checkInSchema = z.object({
  method: z.enum(["QR", "NFC"]),
  qrCode: z.string().optional(),
  cardUid: z.string().optional(),
});

export const POST = withAuth(async ({ user, req }) => {
  const body = checkInSchema.parse(await req.json());

  let studentId: string;
  if (body.method === "QR") {
    if (!body.qrCode) throw new ApiError(422, "QR_CODE_REQUIRED");
    const student = await db.student.findUnique({ where: { qrCode: body.qrCode } });
    if (!student) throw new ApiError(404, "STUDENT_NOT_FOUND", "كود QR غير معروف");
    studentId = student.id;
  } else {
    if (!body.cardUid) throw new ApiError(422, "CARD_UID_REQUIRED");
    const card = await db.nfcCard.findUnique({ where: { cardUid: body.cardUid } });
    if (!card || card.status !== "ACTIVE") throw new ApiError(404, "CARD_NOT_FOUND", "الكارت غير مسجل أو غير مفعل");
    studentId = card.studentId;
    await db.nfcCard.update({ where: { id: card.id }, data: { lastUsedAt: new Date() } });
  }

  const result = await checkInStudent({ studentId, method: body.method, recordedById: user.id });
  return NextResponse.json(result, { status: 201 });
}, "attendance.create");
