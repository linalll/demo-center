import Link from "next/link";
import { requirePagePermission } from "@/lib/permissions/require";
import { getGroupDetail } from "@/lib/services/group.service";
import { AddStudentToGroup } from "@/components/groups/add-student-to-group";

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "الأحد",
  MONDAY: "الإثنين",
  TUESDAY: "الثلاثاء",
  WEDNESDAY: "الأربعاء",
  THURSDAY: "الخميس",
  FRIDAY: "الجمعة",
  SATURDAY: "السبت",
};

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("groups.view");

  const { id } = await params;
  const group = await getGroupDetail(id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{group.name}</h1>
        <p className="mt-1 text-muted">
          {group.subject.name} · {group.teacher.user.fullName}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {group.scheduleSlots.map((s) => (
            <span key={s.id} className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark">
              {DAY_LABELS[s.dayOfWeek]} {s.startTime} - {s.endTime}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">الطلاب ({group.students.length})</h2>
          </div>
          <AddStudentToGroup groupId={group.id} />
          <div className="mt-4 space-y-2">
            {group.students.length === 0 ? (
              <p className="text-sm text-muted">لا يوجد طلاب في هذه المجموعة بعد</p>
            ) : (
              group.students.map((m) => (
                <Link
                  key={m.studentId}
                  href={`/students/${m.studentId}`}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-background"
                >
                  <span className="font-semibold">{m.student.user.fullName}</span>
                  <span className="text-xs text-muted" dir="ltr">{m.student.user.phone}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold">الحصص القادمة</h2>
          <div className="mt-3 space-y-2">
            {group.sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                <span>{new Date(s.date).toLocaleDateString("ar-EG")}</span>
                <span className="text-muted" dir="ltr">{s.startTime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
