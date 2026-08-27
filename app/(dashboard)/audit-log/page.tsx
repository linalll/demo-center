import { requirePagePermission } from "@/lib/permissions/require";
import { db } from "@/lib/db";

export default async function AuditLogPage() {
  const user = await requirePagePermission("audit.view");

  const logs = await db.auditLog.findMany({
    where: { centerId: user.centerId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">سجل العمليات</h1>
        <p className="mt-1 text-muted">آخر 100 عملية حساسة تمت في النظام</p>
      </div>

      <div className="card table-wrap p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background text-right text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">المستخدم</th>
              <th className="px-4 py-3 font-semibold">العملية</th>
              <th className="px-4 py-3 font-semibold">الكيان</th>
              <th className="px-4 py-3 font-semibold">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-4 py-3 font-semibold">{l.user?.fullName ?? "—"}</td>
                <td className="px-4 py-3 text-muted" dir="ltr">{l.action}</td>
                <td className="px-4 py-3 text-muted">{l.entity}{l.entityId ? ` #${l.entityId.slice(0, 6)}` : ""}</td>
                <td className="px-4 py-3 text-muted">{new Date(l.createdAt).toLocaleString("ar-EG")}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">لا توجد عمليات مسجلة بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
