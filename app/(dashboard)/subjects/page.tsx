import { BookOpen } from "lucide-react";
import { requirePagePermission } from "@/lib/permissions/require";
import { db } from "@/lib/db";
import { SubjectQuickAdd } from "@/components/subjects/subject-quick-add";

export default async function SubjectsPage() {
  const user = await requirePagePermission("subjects.view");

  const subjects = await db.subject.findMany({
    where: { centerId: user.centerId },
    include: { _count: { select: { groups: true, teachers: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">المواد والكورسات</h1>
        <p className="mt-1 text-muted">{subjects.length} مادة</p>
      </div>

      <div className="card max-w-md">
        <p className="mb-3 text-sm font-semibold">إضافة مادة جديدة</p>
        <SubjectQuickAdd />
      </div>

      {subjects.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="font-semibold">لا توجد مواد حتى الآن</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <div key={s.id} className="card">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-light text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-xs text-muted">
                    {s._count.groups} مجموعة · {s._count.teachers} مدرس
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
