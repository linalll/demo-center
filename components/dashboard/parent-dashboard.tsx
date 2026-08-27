import Link from "next/link";
import { CalendarClock, Award, Wallet, Bell } from "lucide-react";
import { db } from "@/lib/db";
import { getParentChildren } from "@/lib/services/dashboard.service";
import { getStudentBalance } from "@/lib/services/finance.service";
import { StatCard } from "@/components/dashboard/stat-card";

const STATUS_LABEL: Record<string, string> = { PRESENT: "حاضر", LATE: "متأخر", ABSENT: "غائب" };
const STATUS_CLASS: Record<string, string> = {
  PRESENT: "bg-green-50 text-success",
  LATE: "bg-amber-50 text-warning",
  ABSENT: "bg-red-50 text-danger",
};

export async function ParentDashboard({
  userId,
  fullName,
  selectedStudentId,
}: {
  userId: string;
  fullName: string;
  selectedStudentId?: string;
}) {
  const children = await getParentChildren(userId);

  if (children.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold">أهلًا، {fullName}</h1>
        <p className="mt-2 text-muted">لا يوجد أبناء مرتبطين بحسابك بعد. تواصل مع إدارة السنتر لربط حساب ابنك.</p>
      </div>
    );
  }

  const active = children.find((c) => c.id === selectedStudentId) ?? children[0];
  const balance = await getStudentBalance(active.id);

  const [nextSessions, upcomingExams, recentAttendance, notifications] = await Promise.all([
    db.session.findMany({
      where: { date: { gte: new Date() }, group: { students: { some: { studentId: active.id, status: "ACTIVE" } } } },
      include: { group: { include: { subject: true } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
    db.exam.findMany({
      where: { date: { gte: new Date() }, group: { students: { some: { studentId: active.id, status: "ACTIVE" } } } },
      include: { subject: true },
      orderBy: { date: "asc" },
      take: 5,
    }),
    db.attendance.findMany({
      where: { studentId: active.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { session: { include: { group: { include: { subject: true } } } } },
    }),
    db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">أهلًا، {fullName}</h1>
          <p className="mt-1 text-muted">متابعة أبنائك في سنتر أنمكا</p>
        </div>
        {children.length > 1 && (
          <div className="flex gap-2">
            {children.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard?child=${c.id}`}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  c.id === active.id ? "bg-primary text-white" : "bg-surface text-muted hover:text-foreground"
                }`}
              >
                {c.user.fullName}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="حصص قادمة" value={nextSessions.length} icon={CalendarClock} />
        <StatCard label="امتحانات قادمة" value={upcomingExams.length} icon={Award} />
        <StatCard
          label="المتبقي"
          value={`${balance.remaining.toString()} ج.م`}
          icon={Wallet}
          tone={balance.remaining.gt(0) ? "danger" : "success"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-bold">الحصص القادمة</h2>
          {nextSessions.length === 0 ? (
            <p className="text-sm text-muted">لا توجد حصص قادمة</p>
          ) : (
            <div className="space-y-2">
              {nextSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                  <span className="font-semibold">{s.group.subject.name}</span>
                  <span className="text-muted">{new Date(s.date).toLocaleDateString("ar-EG")} · {s.startTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-3 font-bold">آخر الحضور</h2>
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-muted">لا يوجد سجل حضور بعد</p>
          ) : (
            <div className="space-y-2">
              {recentAttendance.map((a) => (
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
        <h2 className="mb-3 flex items-center gap-2 font-bold"><Bell className="h-4 w-4" /> آخر الإشعارات</h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted">لا توجد إشعارات</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-xl border border-border px-4 py-3 text-sm">
                <p className="font-semibold">{n.title}</p>
                <p className="text-muted">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link href={`/students/${active.id}`} className="btn-secondary inline-flex">
        عرض الملف الكامل لـ {active.user.fullName}
      </Link>
    </div>
  );
}
