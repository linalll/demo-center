import { withAuth } from "@/lib/api/handler";
import { getExamReport } from "@/lib/services/report.service";
import { toCsv, csvResponse } from "@/lib/utils/csv";

export const GET = withAuth(async ({ user }) => {
  const rows = await getExamReport(user.centerId);

  const csv = toCsv(
    ["الامتحان", "المادة", "المجموعة", "عدد النتائج", "المتوسط", "أعلى درجة", "أقل درجة"],
    rows.map((r) => [r.exam.name, r.exam.subject.name, r.exam.group.name, r.resultsCount, r.average, r.highest, r.lowest]),
  );

  return csvResponse("exam-report.csv", csv);
}, "reports.view");
