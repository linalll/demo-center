import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePagePermission } from "@/lib/permissions/require";
import { db } from "@/lib/db";

export default async function TeachersPage() {
  const user = await requirePagePermission("teachers.view");

  const teachers = await db.teacher.findMany({
    where: { user: { centerId: user.centerId } },
    include: { user: true, subjects: true, groups: true },
    orderBy: { user: { fullName: "asc" } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">المدرسين</h1>
          <p className="mt-1 text-muted">{teachers.length} مدرس</p>
        </div>
        <Link href="/teachers/new" className="btn-primary">
          <Plus className="h-4 w-4" /> إضافة مدرس
        </Link>
      </div>

      {teachers.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="font-semibold">لا يوجد مدرسين حتى الآن</p>
          <Link href="/teachers/new" className="btn-primary mt-3 inline-flex">
            <Plus className="h-4 w-4" /> إضافة مدرس
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <Link key={t.id} href={`/teachers/${t.id}`} className="card block card-interactive stagger-item">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-light text-lg font-bold text-primary-dark">
                  {t.user.fullName.slice(0, 1)}
                </div>
                <div>
                  <p className="font-bold">{t.user.fullName}</p>
                  <p className="text-xs text-muted" dir="ltr">{t.user.phone}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.subjects.map((s) => (
                  <span key={s.id} className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark">
                    {s.name}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">{t.groups.length} مجموعة</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
