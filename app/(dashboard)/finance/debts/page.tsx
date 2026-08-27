import Link from "next/link";
import { requirePagePermission } from "@/lib/permissions/require";
import { listStudentDebts } from "@/lib/services/finance.service";

export default async function DebtsPage() {
  const user = await requirePagePermission("finance.view");

  const debts = await listStudentDebts(user.centerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">المديونيات</h1>
        <p className="mt-1 text-muted">{debts.length} طالب عليهم مستحقات</p>
      </div>

      {debts.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="font-semibold">لا توجد مديونيات حاليًا 🎉</p>
        </div>
      ) : (
        <div className="card table-wrap p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background text-right text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">الطالب</th>
                <th className="px-4 py-3 font-semibold">إجمالي المستحق</th>
                <th className="px-4 py-3 font-semibold">المدفوع</th>
                <th className="px-4 py-3 font-semibold">المتبقي</th>
              </tr>
            </thead>
            <tbody>
              {debts.map(({ student, balance }) => (
                <tr key={student.id} className="border-b border-border last:border-0 hover:bg-background">
                  <td className="px-4 py-3">
                    <Link href={`/students/${student.id}`} className="font-semibold hover:text-primary">
                      {student.user.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{balance.totalCharges.toString()} ج.م</td>
                  <td className="px-4 py-3 text-muted">{balance.totalPaid.toString()} ج.م</td>
                  <td className="px-4 py-3 font-bold text-danger">{balance.remaining.toString()} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
