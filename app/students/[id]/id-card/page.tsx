import { redirect, notFound } from "next/navigation";
import QRCode from "qrcode";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessStudent } from "@/lib/permissions/student-access";
import { getStudentProfile } from "@/lib/services/student.service";
import { PrintButton } from "@/components/finance/print-button";

export default async function StudentIdCardPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  if (!(await canAccessStudent(user, id))) notFound();

  const student = await getStudentProfile(id);
  const qrDataUrl = await QRCode.toDataURL(student.qrCode, { margin: 1, width: 160 });

  return (
    <div className="mx-auto max-w-sm p-6">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-sm print:border-0 print:shadow-none">
        <div className="bg-primary px-5 py-4 text-white">
          <p className="text-sm font-bold">سنتر أنمكا</p>
          <p className="text-xs text-primary-light">ANMKA Center</p>
        </div>
        <div className="flex items-center gap-4 p-5">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-primary-light text-xl font-bold text-primary-dark">
            {student.user.fullName.slice(0, 1)}
          </div>
          <div>
            <p className="font-bold">{student.user.fullName}</p>
            <p className="text-xs text-muted" dir="ltr">{student.studentCode}</p>
            <p className="text-xs text-muted">{student.grade?.name ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-border p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR Code" className="h-24 w-24" />
          <div className="text-end text-xs text-muted">
            <p>حالة كارت NFC</p>
            <p className="mt-1 font-bold text-foreground">
              {student.nfcCards.length > 0 ? "مفعّل" : "غير مفعّل"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
