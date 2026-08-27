import Link from "next/link";
import { Clock, Users, Award } from "lucide-react";
import { getTeacherDashboardData } from "@/lib/services/dashboard.service";
import { StatCard } from "@/components/dashboard/stat-card";

export async function TeacherDashboard({ userId, fullName }: { userId: string; fullName: string }) {
  const data = await getTeacherDashboardData(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">أهلًا، {fullName}</h1>
        <p className="mt-1 text-muted">حصصك اليوم ومجموعاتك</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="حصص اليوم" value={data.sessionsToday.length} icon={Clock} />
        <StatCard label="مجموعاتي" value={data.groups} icon={Users} />
        <StatCard label="امتحانات قادمة" value={data.upcomingExams.length} icon={Award} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-bold">حصص اليوم</h2>
        {data.sessionsToday.length === 0 ? (
          <p className="text-sm text-muted">لا توجد حصص اليوم</p>
        ) : (
          <div className="space-y-2">
            {data.sessionsToday.map((s) => (
              <Link
                key={s.id}
                href={`/attendance/prepare/${s.id}`}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-background"
              >
                <div>
                  <p className="font-semibold">{s.group.subject.name} — {s.group.name}</p>
                  <p className="text-xs text-muted">{s.startTime}</p>
                </div>
                <span className="text-xs text-muted">{s._count.attendances}/{s._count.expectedAttendances}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-3 font-bold">الامتحانات القادمة</h2>
        {data.upcomingExams.length === 0 ? (
          <p className="text-sm text-muted">لا توجد امتحانات قادمة</p>
        ) : (
          <div className="space-y-2">
            {data.upcomingExams.map((e) => (
              <Link key={e.id} href={`/exams/${e.id}`} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-background">
                <span className="font-semibold">{e.name}</span>
                <span className="text-xs text-muted">{new Date(e.date).toLocaleDateString("ar-EG")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
