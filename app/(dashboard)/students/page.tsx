import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requirePagePermission } from "@/lib/permissions/require";
import { listStudents } from "@/lib/services/student.service";
import { StudentsTable } from "@/components/students/students-table";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const user = await requirePagePermission("students.view");

  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const { items, total, pageSize } = await listStudents(user.centerId, {
    q: sp.q,
    page,
    pageSize: 20,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">الطلاب</h1>
          <p className="mt-1 text-muted">{total} طالب مسجل</p>
        </div>
        <Link href="/students/new" className="btn-primary">
          <Plus className="h-4 w-4" /> إضافة طالب
        </Link>
      </div>

      <form className="relative max-w-sm">
        <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="ابحث بالاسم أو الهاتف أو الكود..."
          className="input pe-10"
        />
      </form>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <StudentsTable items={items} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/students?page=${p}${sp.q ? `&q=${sp.q}` : ""}`}
              className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold transition ${
                p === page ? "bg-primary text-white" : "text-muted hover:bg-background"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card animate-enter flex flex-col items-center gap-3 py-16 text-center">
      <p className="font-semibold">لا يوجد طلاب حتى الآن</p>
      <p className="text-sm text-muted">ابدأ بإضافة أول طالب في السنتر</p>
      <Link href="/students/new" className="btn-primary mt-2">
        <Plus className="h-4 w-4" /> إضافة طالب
      </Link>
    </div>
  );
}
