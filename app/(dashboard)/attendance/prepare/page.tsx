import Link from "next/link";
import { startOfDay, endOfDay } from "date-fns";
import { Users, Clock, ChevronLeft } from "lucide-react";
import { requirePagePermission } from "@/lib/permissions/require";
import { db } from "@/lib/db";

export default async function PrepareSessionListPage() {
  const user = await requirePagePermission("attendance.view");

  const today = new Date();
  const sessions = await db.session.findMany({
    where: {
      date: { gte: startOfDay(today), lte: endOfDay(today) },
      group: { centerId: user.centerId },
    },
    include: {
      group: { include: { subject: true, teacher: { include: { user: true } } } },
      _count: { select: { expectedAttendances: true, attendances: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">تحضير الحصص</h1>
        <p className="mt-1 text-muted">حصص اليوم — {today.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {sessions.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="font-semibold">لا توجد حصص اليوم</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/attendance/prepare/${s.id}`}
              className="card flex items-center justify-between card-interactive stagger-item"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-light text-primary-dark">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{s.group.subject.name} — {s.group.name}</p>
                  <p className="text-sm text-muted">{s.group.teacher.user.fullName} · {s.startTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-sm text-muted">
                  <Users className="h-4 w-4" /> {s._count.attendances}/{s._count.expectedAttendances}
                </span>
                <ChevronLeft className="h-5 w-5 text-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
