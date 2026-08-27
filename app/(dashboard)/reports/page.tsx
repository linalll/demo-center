import Link from "next/link";
import { Download } from "lucide-react";
import { requirePagePermission } from "@/lib/permissions/require";
import { getAttendanceReport, getExamReport, getTeacherReport } from "@/lib/services/report.service";
import { db } from "@/lib/db";

const TABS = [
  { key: "attendance", label: "تقارير الحضور" },
  { key: "financial", label: "تقارير مالية" },
  { key: "exams", label: "تقارير الامتحانات" },
  { key: "teachers", label: "تقارير المدرسين" },
] as const;

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ tab?: string; from?: string; to?: string }> }) {
  const user = await requirePagePermission("reports.view");

  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? sp.tab! : "attendance";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">التقارير</h1>
        <p className="mt-1 text-muted">تقارير الحضور، المالية، الامتحانات، والمدرسين — قابلة للتصدير</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/reports?tab=${t.key}`}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "attendance" && <AttendanceReport centerId={user.centerId} from={sp.from} to={sp.to} />}
      {tab === "financial" && <FinancialReport centerId={user.centerId} />}
      {tab === "exams" && <ExamsReport centerId={user.centerId} />}
      {tab === "teachers" && <TeachersReport centerId={user.centerId} />}
    </div>
  );
}

async function AttendanceReport({ centerId, from, to }: { centerId: string; from?: string; to?: string }) {
  const rows = await getAttendanceReport(centerId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex items-center gap-2">
          <input type="hidden" name="tab" value="attendance" />
          <input type="date" name="from" defaultValue={from} className="input" />
          <input type="date" name="to" defaultValue={to} className="input" />
          <button className="btn-secondary">فلترة</button>
        </form>
        <a href="/api/reports/attendance/export" className="btn-secondary">
          <Download className="h-4 w-4" /> تصدير CSV
        </a>
      </div>
      <div className="card table-wrap p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background text-right text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">الطالب</th>
              <th className="px-4 py-3 font-semibold">حاضر</th>
              <th className="px-4 py-3 font-semibold">متأخر</th>
              <th className="px-4 py-3 font-semibold">غائب</th>
              <th className="px-4 py-3 font-semibold">نسبة الحضور</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.student.id} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-4 py-3 font-semibold">{r.student.user.fullName}</td>
                <td className="px-4 py-3 text-success">{r.present}</td>
                <td className="px-4 py-3 text-warning">{r.late}</td>
                <td className="px-4 py-3 text-danger">{r.absent}</td>
                <td className="px-4 py-3">{r.attendanceRate}%</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">لا توجد بيانات حضور</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function FinancialReport({ centerId }: { centerId: string }) {
  const [payments, expenses] = await Promise.all([
    db.payment.findMany({ where: { student: { user: { centerId } } }, include: { student: { include: { user: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.expense.findMany({ where: { centerId }, orderBy: { date: "desc" }, take: 20 }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <a href="/api/reports/financial/export" className="btn-secondary">
          <Download className="h-4 w-4" /> تصدير CSV
        </a>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-bold">آخر المدفوعات</h2>
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span>{p.student.user.fullName}</span>
                <span className="font-semibold text-success">{p.amount.toString()} ج.م</span>
              </div>
            ))}
            {payments.length === 0 && <p className="text-sm text-muted">لا توجد مدفوعات</p>}
          </div>
        </div>
        <div className="card">
          <h2 className="mb-3 font-bold">آخر المصروفات</h2>
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="flex justify-between text-sm">
                <span>{e.category}</span>
                <span className="font-semibold text-danger">{e.amount.toString()} ج.م</span>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-sm text-muted">لا توجد مصروفات</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

async function ExamsReport({ centerId }: { centerId: string }) {
  const rows = await getExamReport(centerId);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <a href="/api/reports/exams/export" className="btn-secondary">
          <Download className="h-4 w-4" /> تصدير CSV
        </a>
      </div>
      <div className="card table-wrap p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background text-right text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">الامتحان</th>
              <th className="px-4 py-3 font-semibold">المادة</th>
              <th className="px-4 py-3 font-semibold">المتوسط</th>
              <th className="px-4 py-3 font-semibold">أعلى درجة</th>
              <th className="px-4 py-3 font-semibold">أقل درجة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.exam.id} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-4 py-3 font-semibold">{r.exam.name}</td>
                <td className="px-4 py-3 text-muted">{r.exam.subject.name}</td>
                <td className="px-4 py-3">{r.average}</td>
                <td className="px-4 py-3 text-success">{r.highest}</td>
                <td className="px-4 py-3 text-danger">{r.lowest}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">لا توجد امتحانات بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function TeachersReport({ centerId }: { centerId: string }) {
  const rows = await getTeacherReport(centerId);

  return (
    <div className="card table-wrap p-0">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-background text-right text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">المدرس</th>
            <th className="px-4 py-3 font-semibold">المجموعات</th>
            <th className="px-4 py-3 font-semibold">الطلاب</th>
            <th className="px-4 py-3 font-semibold">الحصص</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.teacher.id} className="border-b border-border last:border-0 hover:bg-background">
              <td className="px-4 py-3 font-semibold">{r.teacher.user.fullName}</td>
              <td className="px-4 py-3">{r.groupsCount}</td>
              <td className="px-4 py-3">{r.studentsCount}</td>
              <td className="px-4 py-3">{r.sessionsCount}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">لا يوجد مدرسين بعد</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
