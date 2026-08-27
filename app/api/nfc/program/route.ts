import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth, ApiError } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { AuditLogger } from "@/lib/services/audit.service";

// Hardware Integration is deliberately kept out of this route (system.md
// #17: "افصل Hardware Integration عن Business Logic") — the reader device
// is responsible for scanning a physical card and handing back its UID;
// this endpoint only persists the resulting studentId <-> cardUid link.
const programSchema = z.object({
  studentId: z.string().cuid(),
  cardUid: z.string().min(4),
  device: z.string().optional(),
});

export const POST = withAuth(async ({ user, req }) => {
  const body = programSchema.parse(await req.json());

  const inUse = await db.nfcCard.findUnique({ where: { cardUid: body.cardUid } });
  if (inUse && inUse.studentId !== body.studentId) {
    throw new ApiError(409, "CARD_ALREADY_ASSIGNED", "هذا الكارت مربوط بطالب آخر بالفعل");
  }

  const card = await db.nfcCard.upsert({
    where: { cardUid: body.cardUid },
    update: { studentId: body.studentId, status: "ACTIVE", device: body.device },
    create: { studentId: body.studentId, cardUid: body.cardUid, device: body.device },
  });

  await AuditLogger.log(user, "nfc.program", "NfcCard", card.id, body);
  return NextResponse.json({ card }, { status: 201 });
}, "nfc.program");
