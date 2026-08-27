import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePagePermission } from "@/lib/permissions/require";
import { listCenterUsers } from "@/lib/services/user.service";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير",
  assistant: "موظف",
  teacher: "مدرس",
  student: "طالب",
  parent: "ولي أمر",
};

export default async function UsersPage() {
  const user = await requirePagePermission("users.manage");

  const users = await listCenterUsers(user.centerId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">المستخدمين والصلاحيات</h1>
          <p className="mt-1 text-muted">{users.length} مستخدم</p>
        </div>
        <Link href="/users/new" className="btn-primary">
          <Plus className="h-4 w-4" /> إضافة موظف
        </Link>
      </div>

      <div className="card table-wrap p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background text-right text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">الاسم</th>
              <th className="px-4 py-3 font-semibold">الهاتف</th>
              <th className="px-4 py-3 font-semibold">الدور</th>
              <th className="px-4 py-3 font-semibold">الحالة</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-4 py-3 font-semibold">{u.fullName}</td>
                <td className="px-4 py-3 text-muted" dir="ltr">{u.phone}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark">
                    {ROLE_LABELS[u.role.key] ?? u.role.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.status === "ACTIVE" ? "bg-green-50 text-success" : "bg-red-50 text-danger"}`}>
                    {u.status === "ACTIVE" ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="px-4 py-3 text-left">
                  {u.role.key === "assistant" && (
                    <Link href={`/users/${u.id}`} className="text-sm font-semibold text-primary hover:text-primary-dark">
                      تعديل الصلاحيات
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
