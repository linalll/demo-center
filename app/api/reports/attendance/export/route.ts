import { withAuth } from "@/lib/api/handler";
import { getAttendanceReport } from "@/lib/services/report.service";
import { toCsv, csvResponse } from "@/lib/utils/csv";

export const GET = withAuth(async ({ user, req }) => {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const rows = await getAttendanceReport(user.centerId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);

  const csv = toCsv(
    ["الطالب", "الهاتف", "حاضر", "متأخر", "غائب", "الإجمالي", "نسبة الحضور %"],
    rows.map((r) => [r.student.user.fullName, r.student.user.phone, r.present, r.late, r.absent, r.total, r.attendanceRate]),
  );

  return csvResponse("attendance-report.csv", csv);
}, "reports.view");
