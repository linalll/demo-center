import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { toCsv, csvResponse } from "@/lib/utils/csv";

const STATUS_LABELS: Record<string, string> = { ACTIVE: "نشط", INACTIVE: "غير نشط", SUSPENDED: "معلّق" };

export const GET = withAuth(async ({ user, req }) => {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : null;

  const students = await db.student.findMany({
    where: { user: { centerId: user.centerId }, ...(ids ? { id: { in: ids } } : {}) },
    include: { user: true, grade: { include: { stage: true } } },
    orderBy: { enrollmentDate: "desc" },
  });

  const csv = toCsv(
    ["الاسم", "كود الطالب", "الهاتف", "المرحلة", "الصف", "ولي الأمر", "هاتف ولي الأمر", "الحالة", "تاريخ التسجيل"],
    students.map((s) => [
      s.user.fullName,
      s.studentCode,
      s.user.phone,
      s.grade?.stage.name ?? "",
      s.grade?.name ?? "",
      s.guardianName ?? "",
      s.guardianPhone ?? "",
      STATUS_LABELS[s.status] ?? s.status,
      s.enrollmentDate.toISOString().slice(0, 10),
    ]),
  );

  return csvResponse("students.csv", csv);
}, "students.view");
