import { requirePagePermission } from "@/lib/permissions/require";
import { CreateAssistantForm } from "@/components/users/create-assistant-form";

export default async function NewAssistantPage() {
  await requirePagePermission("users.manage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">إضافة موظف</h1>
        <p className="mt-1 text-muted">حدد صلاحيات هذا الموظف بدقة — لن يرى إلا ما تحدده له</p>
      </div>
      <CreateAssistantForm />
    </div>
  );
}
