import Link from "next/link";
import { Plus, Users as UsersIcon } from "lucide-react";
import { requirePagePermission } from "@/lib/permissions/require";
import { listGroups } from "@/lib/services/group.service";

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "الأحد",
  MONDAY: "الإثنين",
  TUESDAY: "الثلاثاء",
  WEDNESDAY: "الأربعاء",
  THURSDAY: "الخميس",
  FRIDAY: "الجمعة",
  SATURDAY: "السبت",
};

export default async function GroupsPage() {
  const user = await requirePagePermission("groups.view");
  const groups = await listGroups(user.centerId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">المجموعات</h1>
          <p className="mt-1 text-muted">{groups.length} مجموعة</p>
        </div>
        <Link href="/groups/new" className="btn-primary">
          <Plus className="h-4 w-4" /> إنشاء مجموعة
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <p className="font-semibold">لا توجد مجموعات حتى الآن</p>
          <Link href="/groups/new" className="btn-primary mt-2">
            <Plus className="h-4 w-4" /> إنشاء مجموعة
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Link key={g.id} href={`/groups/${g.id}`} className="card block card-interactive stagger-item">
              <div className="flex items-start justify-between">
                <p className="font-bold">{g.name}</p>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <UsersIcon className="h-3.5 w-3.5" /> {g._count.students}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {g.subject.name} · {g.teacher.user.fullName}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.scheduleSlots.map((s) => (
                  <span key={s.id} className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark">
                    {DAY_LABELS[s.dayOfWeek]} {s.startTime}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
