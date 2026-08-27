import Link from "next/link";
import { CalendarClock, Award, Wallet } from "lucide-react";
import { getStudentDashboardData } from "@/lib/services/dashboard.service";
import { StatCard } from "@/components/dashboard/stat-card";

const STATUS_LABEL: Record<string, string> = { PRESENT: "حاضر", LATE: "متأخر", ABSENT: "غائب" };
const STATUS_CLASS: Record<string, string> = {
  PRESENT: "bg-green-50 text-success",
  LATE: "bg-amber-50 text-warning",
  ABSENT: "bg-red-50 text-danger",
};

export async function StudentDashboard({ userId, fullName }: { userId: string; fullName: string }) {
  const data = await getStudentDashboardData(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">أهلًا، {fullName}</h1>
        <p className="mt-1 text-muted">جدولك وامتحاناتك القادمة</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="حصص قادمة" value={data.nextSessions.length} icon={CalendarClock} />
        <StatCard label="امتحانات قادمة" value={data.upcomingExams.length} icon={Award} />
        <StatCard
          label="المتبقي عليّ"
          value={`${data.balance.remaining.toString()} ج.م`}
          icon={Wallet}
          tone={data.balance.remaining.gt(0) ? "danger" : "success"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-bold">الحصص القادمة</h2>
          {data.nextSessions.length === 0 ? (
            <p className="text-sm text-muted">لا توجد حصص قادمة</p>
          ) : (
            <div className="space-y-2">
              {data.nextSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                  <span className="font-semibold">{s.group.subject.name} — {s.group.name}</span>
                  <span className="text-muted">{new Date(s.date).toLocaleDateString("ar-EG")} · {s.startTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-3 font-bold">آخر الحضور</h2>
          {data.recentAttendance.length === 0 ? (
            <p className="text-sm text-muted">لا يوجد سجل حضور بعد</p>
          ) : (
            <div className="space-y-2">
              {data.recentAttendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                  <span>{a.session.group.subject.name}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 font-bold">الامتحانات القادمة</h2>
        {data.upcomingExams.length === 0 ? (
          <p className="text-sm text-muted">لا توجد امتحانات قادمة</p>
        ) : (
          <div className="space-y-2">
            {data.upcomingExams.map((e) => (
              <Link key={e.id} href={`/exams/${e.id}/take`} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-background">
                <span className="font-semibold">{e.name} — {e.subject.name}</span>
                <span className="text-xs text-muted">{new Date(e.date).toLocaleDateString("ar-EG")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
