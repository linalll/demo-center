import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { recordPayment } from "@/lib/services/finance.service";
import { notifyPayment } from "@/lib/services/notification.service";
import { AuditLogger } from "@/lib/services/audit.service";

const paymentSchema = z.object({
  studentId: z.string().cuid(),
  amount: z.coerce.number().positive(),
  method: z.string().optional(),
  note: z.string().optional(),
});

export const POST = withAuth(async ({ user, req }) => {
  const body = paymentSchema.parse(await req.json());
  const payment = await recordPayment({ ...body, receivedById: user.id });
  await notifyPayment(payment.id).catch((e) => console.error(e));
  await AuditLogger.log(user, "payment.create", "Payment", payment.id, body);
  return NextResponse.json({ payment }, { status: 201 });
}, "finance.create");
