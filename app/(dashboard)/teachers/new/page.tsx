import { requirePagePermission } from "@/lib/permissions/require";
import { TeacherForm } from "@/components/teachers/teacher-form";

export default async function NewTeacherPage() {
  await requirePagePermission("teachers.create");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">إضافة مدرس</h1>
        <p className="mt-1 text-muted">أدخل بيانات المدرس وحدد المواد التي يدرّسها</p>
      </div>
      <TeacherForm />
    </div>
  );
}
