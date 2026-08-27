import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getStudentBalance } from "@/lib/services/finance.service";
import { db } from "@/lib/db";

export const GET = withAuth(async ({ req }) => {
  const studentId = new URL(req.url).pathname.split("/")[4];
  const [balance, payments] = await Promise.all([
    getStudentBalance(studentId),
    db.payment.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  return NextResponse.json({ balance, payments });
}, "finance.view");
