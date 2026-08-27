import { requirePagePermission } from "@/lib/permissions/require";
import { db } from "@/lib/db";
import { RecordExpenseForm } from "@/components/finance/record-expense-form";

export default async function ExpensesPage() {
  const user = await requirePagePermission("finance.view");

  const expenses = await db.expense.findMany({ where: { centerId: user.centerId }, orderBy: { date: "desc" }, take: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">المصروفات</h1>
        <p className="mt-1 text-muted">متابعة مصروفات السنتر</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card table-wrap p-0 lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background text-right text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">الفئة</th>
                <th className="px-4 py-3 font-semibold">الوصف</th>
                <th className="px-4 py-3 font-semibold">المبلغ</th>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-background">
                  <td className="px-4 py-3 font-semibold">{e.category}</td>
                  <td className="px-4 py-3 text-muted">{e.description ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-danger">{e.amount.toString()} ج.م</td>
                  <td className="px-4 py-3 text-muted">{new Date(e.date).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">لا توجد مصروفات مسجلة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <RecordExpenseForm />
      </div>
    </div>
  );
}
