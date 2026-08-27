import { Decimal } from "@prisma/client/runtime/library";
import { db } from "@/lib/db";
import { BillingModel } from "@prisma/client";

function currentPeriod(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Attendance-based billing (system.md #29): when a student checks in
 * (present or late) for a group billed PER_SESSION, a charge is created
 * automatically using that group's price. MONTHLY subscriptions are charged
 * when the student joins the group (see chargeForNewGroupMembership); CUSTOM
 * billing is left to manual charges created by Admin.
 */
export async function applyPerSessionCharge(studentId: string, sessionId: string) {
  const session = await db.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: { group: true },
  });

  if (session.group.billingModel !== BillingModel.PER_SESSION) return null;

  const existing = await db.studentCharge.findFirst({ where: { studentId, sessionId } });
  if (existing) return existing;

  return db.studentCharge.create({
    data: {
      studentId,
      groupId: session.groupId,
      sessionId,
      amount: session.group.price,
      reason: `حصة ${session.group.name} بتاريخ ${session.date.toISOString().slice(0, 10)}`,
    },
  });
}

export async function createMonthlySubscriptionCharge(studentId: string, groupId: string, period = currentPeriod()) {
  const group = await db.group.findUniqueOrThrow({ where: { id: groupId } });

  const existing = await db.studentCharge.findUnique({
    where: { studentId_groupId_period: { studentId, groupId, period } },
  });
  if (existing) return existing;

  return db.studentCharge.create({
    data: {
      studentId,
      groupId,
      amount: group.price,
      period,
      reason: `اشتراك شهري - ${group.name} - ${period}`,
    },
  });
}

/**
 * Called right when a student is enrolled in a Group (system.md: "اضف
 * الطالب للمجموعة → تحديث المالية تلقائيًا"). MONTHLY groups charge the
 * current month immediately; PER_SESSION groups only charge as attendance
 * happens (applyPerSessionCharge); CUSTOM billing is left to Admin.
 */
export async function chargeForNewGroupMembership(studentId: string, groupId: string) {
  const group = await db.group.findUniqueOrThrow({ where: { id: groupId } });
  if (group.billingModel === BillingModel.MONTHLY) {
    return createMonthlySubscriptionCharge(studentId, groupId);
  }
  return null;
}

/** Pure ledger math (system.md #28/#29), split out so it's testable without a database. */
export function computeBalance(totalCharges: Decimal, totalPaid: Decimal) {
  return { totalCharges, totalPaid, remaining: totalCharges.sub(totalPaid) };
}

export async function getStudentBalance(studentId: string) {
  const [charges, payments] = await Promise.all([
    db.studentCharge.aggregate({ where: { studentId }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { studentId }, _sum: { amount: true } }),
  ]);

  return computeBalance(charges._sum.amount ?? new Decimal(0), payments._sum.amount ?? new Decimal(0));
}

export async function recordPayment(input: {
  studentId: string;
  amount: number;
  method?: string;
  note?: string;
  receivedById: string;
}) {
  return db.payment.create({
    data: {
      studentId: input.studentId,
      amount: input.amount,
      method: input.method ?? "CASH",
      note: input.note,
      receivedById: input.receivedById,
    },
  });
}

/** system.md #32 — "أكثر الطلاب مديونية" / debts report. */
export async function listStudentDebts(centerId: string) {
  const students = await db.student.findMany({
    where: { user: { centerId }, status: "ACTIVE" },
    include: { user: true },
  });

  const withBalance = await Promise.all(
    students.map(async (s) => ({ student: s, balance: await getStudentBalance(s.id) })),
  );

  return withBalance
    .filter((s) => s.balance.remaining.gt(0))
    .sort((a, b) => (a.balance.remaining.gt(b.balance.remaining) ? -1 : 1));
}

export async function getCenterFinancialSummary(centerId: string, from?: Date, to?: Date) {
  const dateFilter = from || to ? { createdAt: { gte: from, lte: to } } : {};

  const [paid, expenses, students] = await Promise.all([
    db.payment.aggregate({
      where: { student: { user: { centerId } }, ...dateFilter },
      _sum: { amount: true },
    }),
    db.expense.aggregate({ where: { centerId, ...dateFilter }, _sum: { amount: true } }),
    db.student.findMany({ where: { user: { centerId } }, select: { id: true } }),
  ]);

  let totalDebt = new Decimal(0);
  let studentsWithDebt = 0;
  for (const s of students) {
    const balance = await getStudentBalance(s.id);
    if (balance.remaining.gt(0)) {
      totalDebt = totalDebt.add(balance.remaining);
      studentsWithDebt += 1;
    }
  }

  const totalCollected = paid._sum.amount ?? new Decimal(0);
  const totalExpenses = expenses._sum.amount ?? new Decimal(0);

  return {
    totalCollected,
    totalExpenses,
    netProfit: totalCollected.sub(totalExpenses),
    totalDebt,
    studentsWithDebt,
  };
}
