import { requirePagePermission } from "@/lib/permissions/require";
import { StagesManager } from "@/components/subjects/stages-manager";

export default async function StagesPage() {
  await requirePagePermission("subjects.view");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">المراحل الدراسية والصفوف</h1>
        <p className="mt-1 text-muted">تُستخدم عند إضافة الطلاب وربطهم بالمجموعات المناسبة</p>
      </div>
      <StagesManager />
    </div>
  );
}
