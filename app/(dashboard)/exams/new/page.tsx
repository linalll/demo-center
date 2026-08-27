import { requirePagePermission } from "@/lib/permissions/require";
import { ExamForm } from "@/components/exams/exam-form";

export default async function NewExamPage() {
  await requirePagePermission("exams.create");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">إنشاء امتحان</h1>
        <p className="mt-1 text-muted">امتحان ورقي لرصد النتائج يدويًا، أو إلكتروني بأسئلة تُصحح تلقائيًا</p>
      </div>
      <ExamForm />
    </div>
  );
}
