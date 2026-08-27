import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { AuditLogger } from "@/lib/services/audit.service";

export const GET = withAuth(async ({ user }) => {
  const expenses = await db.expense.findMany({ where: { centerId: user.centerId }, orderBy: { date: "desc" }, take: 100 });
  return NextResponse.json({ expenses });
}, "finance.view");

const expenseSchema = z.object({
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
});

export const POST = withAuth(async ({ user, req }) => {
  const body = expenseSchema.parse(await req.json());
  const expense = await db.expense.create({ data: { centerId: user.centerId, ...body } });
  await AuditLogger.log(user, "expense.create", "Expense", expense.id, body);
  return NextResponse.json({ expense }, { status: 201 });
}, "finance.create");
