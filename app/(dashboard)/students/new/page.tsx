import { requirePagePermission } from "@/lib/permissions/require";
import { StudentForm } from "@/components/students/student-form";

export default async function NewStudentPage() {
  await requirePagePermission("students.create");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">إضافة طالب</h1>
        <p className="mt-1 text-muted">أدخل بيانات الطالب الأساسية — يمكن استكمال باقي البيانات لاحقًا</p>
      </div>
      <StudentForm />
    </div>
  );
}
