import Link from "next/link";
import { Plus, Award } from "lucide-react";
import { requirePagePermission } from "@/lib/permissions/require";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions/check";
import { ROLE_KEYS } from "@/lib/permissions/definitions";

export default async function ExamsPage() {
  const user = await requirePagePermission("exams.view");

  const isStudent = user.role.key === ROLE_KEYS.STUDENT;
  const student = isStudent ? await db.student.findUnique({ where: { userId: user.id } }) : null;

  const exams = await db.exam.findMany({
    where: isStudent
      ? { group: { students: { some: { studentId: student?.id, status: "ACTIVE" } } } }
      : { centerId: user.centerId },
    include: { subject: true, group: true, teacher: { include: { user: true } } },
    orderBy: { date: "desc" },
  });

  const canCreate = hasPermission(user, "exams.create");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">الامتحانات</h1>
          <p className="mt-1 text-muted">{exams.length} امتحان</p>
        </div>
        {canCreate && (
          <Link href="/exams/new" className="btn-primary">
            <Plus className="h-4 w-4" /> إنشاء امتحان
          </Link>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="font-semibold">لا توجد امتحانات حتى الآن</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <Link key={e.id} href={isStudent ? `/exams/${e.id}/take` : `/exams/${e.id}`} className="card block card-interactive stagger-item">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-light text-primary">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{e.name}</p>
                  <p className="text-xs text-muted">{e.subject.name} · {e.group.name}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>{new Date(e.date).toLocaleDateString("ar-EG")}</span>
                <span className="rounded-full bg-background px-2 py-1 font-semibold">
                  {e.examType === "ONLINE" ? "إلكتروني" : "ورقي"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
