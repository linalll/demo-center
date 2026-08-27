import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/permissions/require";
import { OfflineResultForm } from "@/components/exams/offline-result-form";

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("exams.view");

  const { id } = await params;
  const exam = await db.exam.findUniqueOrThrow({
    where: { id },
    include: {
      subject: true,
      group: true,
      teacher: { include: { user: true } },
      results: { include: { student: { include: { user: true } } }, orderBy: { score: "desc" } },
    },
  });

  const totalMarks = Number(exam.totalMarks);
  const avg = exam.results.length
    ? exam.results.reduce((sum, r) => sum + Number(r.score), 0) / exam.results.length
    : 0;
  const highest = exam.results.length ? Math.max(...exam.results.map((r) => Number(r.score))) : 0;
  const lowest = exam.results.length ? Math.min(...exam.results.map((r) => Number(r.score))) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{exam.name}</h1>
        <p className="mt-1 text-muted">
          {exam.subject.name} · {exam.group.name} · {exam.teacher.user.fullName} · {new Date(exam.date).toLocaleString("ar-EG")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{exam.results.length}</p>
          <p className="text-sm text-muted">عدد النتائج</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{avg.toFixed(1)}</p>
          <p className="text-sm text-muted">المتوسط</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-success">{highest}</p>
          <p className="text-sm text-muted">أعلى درجة</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-danger">{lowest}</p>
          <p className="text-sm text-muted">أقل درجة</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-3 font-bold">النتائج</h2>
          {exam.results.length === 0 ? (
            <p className="text-sm text-muted">لا توجد نتائج مسجلة بعد</p>
          ) : (
            <div className="space-y-2">
              {exam.results.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <span className="font-semibold">{r.student.user.fullName}</span>
                  <span className="text-sm text-muted">
                    {r.score.toString()} / {totalMarks} ({((Number(r.score) / totalMarks) * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {exam.examType === "OFFLINE" && <OfflineResultForm examId={exam.id} totalMarks={totalMarks} />}
      </div>
    </div>
  );
}
