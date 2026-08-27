import Link from "next/link";
import { requirePagePermission } from "@/lib/permissions/require";
import { db } from "@/lib/db";

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "الأحد",
  MONDAY: "الإثنين",
  TUESDAY: "الثلاثاء",
  WEDNESDAY: "الأربعاء",
  THURSDAY: "الخميس",
  FRIDAY: "الجمعة",
  SATURDAY: "السبت",
};

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("teachers.view");

  const { id } = await params;
  const teacher = await db.teacher.findUniqueOrThrow({
    where: { id },
    include: {
      user: true,
      subjects: true,
      groups: { include: { subject: true, scheduleSlots: true, _count: { select: { students: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="card flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-light text-2xl font-bold text-primary-dark">
          {teacher.user.fullName.slice(0, 1)}
        </div>
        <div>
          <h1 className="text-xl font-bold">{teacher.user.fullName}</h1>
          <p className="text-sm text-muted" dir="ltr">{teacher.user.phone}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {teacher.subjects.map((s) => (
              <span key={s.id} className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 font-bold">المجموعات ({teacher.groups.length})</h2>
        <div className="space-y-2">
          {teacher.groups.map((g) => (
            <Link key={g.id} href={`/groups/${g.id}`} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-background">
              <div>
                <p className="font-semibold">{g.name}</p>
                <p className="text-xs text-muted">{g.subject.name} · {g._count.students} طالب</p>
              </div>
              <div className="flex gap-1.5">
                {g.scheduleSlots.map((s) => (
                  <span key={s.id} className="rounded-full bg-background px-2 py-1 text-xs text-muted">
                    {DAY_LABELS[s.dayOfWeek]} {s.startTime}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {teacher.groups.length === 0 && <p className="text-sm text-muted">لا توجد مجموعات لهذا المدرس بعد</p>}
        </div>
      </div>
    </div>
  );
}
