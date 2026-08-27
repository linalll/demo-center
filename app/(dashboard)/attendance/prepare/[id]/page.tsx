import { requirePagePermission } from "@/lib/permissions/require";
import { SessionRoster } from "@/components/attendance/session-roster";

export default async function PrepareSessionPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("attendance.view");

  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">تحضير الحصة</h1>
        <p className="mt-1 text-muted">سجل حضور الطلاب بالـ QR أو يدويًا</p>
      </div>
      <SessionRoster sessionId={id} />
    </div>
  );
}
