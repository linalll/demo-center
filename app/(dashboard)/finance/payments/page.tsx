import Link from "next/link";
import { requirePagePermission } from "@/lib/permissions/require";
import { db } from "@/lib/db";
import { RecordPaymentForm } from "@/components/finance/record-payment-form";

export default async function PaymentsPage() {
  const user = await requirePagePermission("finance.view");

  const payments = await db.payment.findMany({
    where: { student: { user: { centerId: user.centerId } } },
    include: { student: { include: { user: true } }, receivedBy: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">المدفوعات</h1>
        <p className="mt-1 text-muted">آخر 50 دفعة مسجلة</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card table-wrap p-0 lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background text-right text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">الطالب</th>
                <th className="px-4 py-3 font-semibold">المبلغ</th>
                <th className="px-4 py-3 font-semibold">الطريقة</th>
                <th className="px-4 py-3 font-semibold">بواسطة</th>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-background">
                  <td className="px-4 py-3">
                    <Link href={`/students/${p.studentId}/receipt`} className="font-semibold hover:text-primary">
                      {p.student.user.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-semibold text-success">{p.amount.toString()} ج.م</td>
                  <td className="px-4 py-3 text-muted">{p.method}</td>
                  <td className="px-4 py-3 text-muted">{p.receivedBy.fullName}</td>
                  <td className="px-4 py-3 text-muted">{new Date(p.createdAt).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">لا توجد مدفوعات بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <RecordPaymentForm />
      </div>
    </div>
  );
}
