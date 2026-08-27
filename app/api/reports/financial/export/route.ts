import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { toCsv, csvResponse } from "@/lib/utils/csv";

export const GET = withAuth(async ({ user, req }) => {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const dateFilter = from || to ? { createdAt: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } } : {};

  const payments = await db.payment.findMany({
    where: { student: { user: { centerId: user.centerId } }, ...dateFilter },
    include: { student: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    ["الطالب", "المبلغ", "الطريقة", "التاريخ"],
    payments.map((p) => [p.student.user.fullName, p.amount.toString(), p.method, p.createdAt.toISOString().slice(0, 10)]),
  );

  return csvResponse("financial-report.csv", csv);
}, "reports.view");
