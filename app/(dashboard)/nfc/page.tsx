import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/permissions/require";
import { NfcProgramForm } from "@/components/nfc/nfc-program-form";

export default async function NfcPage() {
  const user = await requirePagePermission("nfc.view");

  const cards = await db.nfcCard.findMany({
    where: { student: { user: { centerId: user.centerId } } },
    include: { student: { include: { user: true } } },
    orderBy: { assignedDate: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">برمجة كروت NFC</h1>
        <p className="mt-1 text-muted">اربط كارت NFC فعلي بحساب الطالب لتسجيل الحضور</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NfcProgramForm />

        <div className="card">
          <h2 className="mb-3 font-bold">آخر الكروت المبرمجة</h2>
          <div className="space-y-2">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                <span className="font-semibold">{c.student.user.fullName}</span>
                <span className="text-muted" dir="ltr">{c.cardUid}</span>
              </div>
            ))}
            {cards.length === 0 && <p className="text-sm text-muted">لم تُبرمج أي كروت بعد</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
