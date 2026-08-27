import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessStudent } from "@/lib/permissions/student-access";
import { getStudentProfile } from "@/lib/services/student.service";
import { getStudentBalance } from "@/lib/services/finance.service";
import { db } from "@/lib/db";
import { PrintButton } from "@/components/finance/print-button";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  if (!(await canAccessStudent(user, id))) notFound();

  const student = await getStudentProfile(id);
  const balance = await getStudentBalance(id);
  const lastPayment = await db.payment.findFirst({ where: { studentId: id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <div className="rounded-2xl border border-border p-8 print:border-0">
        <div className="mb-6 text-center">
          <p className="text-lg font-bold">سنتر أنمكا</p>
          <p className="text-xs text-muted">ANMKA Center — إيصال دفع</p>
        </div>

        <div className="space-y-2 border-t border-dashed border-border pt-4 text-sm">
          <Row label="الطالب" value={student.user.fullName} />
          <Row label="كود الطالب" value={student.studentCode} />
          <Row label="تاريخ الإيصال" value={new Date().toLocaleDateString("ar-EG")} />
          {lastPayment && (
            <>
              <Row label="آخر دفعة" value={`${lastPayment.amount.toString()} ج.م`} />
              <Row label="طريقة الدفع" value={lastPayment.method} />
              <Row label="تاريخ الدفعة" value={new Date(lastPayment.createdAt).toLocaleDateString("ar-EG")} />
            </>
          )}
        </div>

        <div className="mt-6 space-y-2 border-t border-dashed border-border pt-4 text-sm">
          <Row label="إجمالي المستحق" value={`${balance.totalCharges.toString()} ج.م`} />
          <Row label="إجمالي المدفوع" value={`${balance.totalPaid.toString()} ج.م`} />
          <Row label="المتبقي" value={`${balance.remaining.toString()} ج.م`} bold />
        </div>

        <p className="mt-8 text-center text-xs text-muted">شكرًا لتعاملكم مع سنتر أنمكا</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={bold ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
