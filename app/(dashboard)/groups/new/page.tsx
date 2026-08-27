import { requirePagePermission } from "@/lib/permissions/require";
import { GroupForm } from "@/components/groups/group-form";

export default async function NewGroupPage() {
  await requirePagePermission("groups.create");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">إنشاء مجموعة</h1>
        <p className="mt-1 text-muted">اربط المادة والمدرس والجدول — ستُنشأ الحصص تلقائيًا لشهر قادم</p>
      </div>
      <GroupForm />
    </div>
  );
}
