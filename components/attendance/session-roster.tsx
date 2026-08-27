"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle, QrCode, Loader2 } from "lucide-react";
import { QrCameraScanner } from "@/components/attendance/qr-camera-scanner";

type Roster = {
  session: { id: string; startTime: string; endTime: string; group: { name: string; subject: { name: string }; teacher: { user: { fullName: string } } } };
  roster: { student: { id: string; user: { fullName: string } }; attendance: { status: "PRESENT" | "LATE" | "ABSENT" } | null }[];
  counts: { total: number; present: number; late: number; absent: number; pending: number };
};

const STATUS_CONFIG = {
  PRESENT: { label: "حاضر", icon: CheckCircle2, className: "bg-green-50 text-success" },
  LATE: { label: "متأخر", icon: Clock, className: "bg-amber-50 text-warning" },
  ABSENT: { label: "غائب", icon: XCircle, className: "bg-red-50 text-danger" },
} as const;

export function SessionRoster({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<Roster | null>(null);
  const [qrInput, setQrInput] = useState("");
  const [scanning, setScanning] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/attendance/sessions/${sessionId}/roster`);
    const json = await res.json();
    setData(json);
  }, [sessionId]);

  useEffect(() => {
    // Fetch-on-mount: `load` performs the request and writes the result via setData.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const checkInByQr = useCallback(
    async (code: string) => {
      setScanning(true);
      try {
        const res = await fetch("/api/attendance/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: "QR", qrCode: code }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.message || "تعذر تسجيل الحضور");
          return;
        }
        toast.success(`تم تسجيل حضور ${json.student.user.fullName}`);
        setQrInput("");
        load();
      } finally {
        setScanning(false);
      }
    },
    [load],
  );

  async function markStatus(studentId: string, status: "PRESENT" | "LATE" | "ABSENT") {
    const res = await fetch("/api/attendance/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, studentId, status }),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message || "تعذر تسجيل الحضور");
      return;
    }
    toast.success("تم تحديث حالة الحضور");
    load();
  }

  if (!data) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-enter space-y-6">
      <div className="card">
        <p className="font-bold">{data.session.group.subject.name} — {data.session.group.name}</p>
        <p className="text-sm text-muted">{data.session.group.teacher.user.fullName} · {data.session.startTime}</p>
        <div className="mt-4 grid grid-cols-4 gap-3 text-center">
          <Counter label="الإجمالي" value={data.counts.total} />
          <Counter label="حاضر" value={data.counts.present} className="text-success" />
          <Counter label="متأخر" value={data.counts.late} className="text-warning" />
          <Counter label="غائب" value={data.counts.absent} className="text-danger" />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (qrInput) checkInByQr(qrInput);
        }}
        className="card flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <QrCode className="hidden h-5 w-5 shrink-0 text-primary sm:block" />
        <input
          value={qrInput}
          onChange={(e) => setQrInput(e.target.value)}
          placeholder="امسح أو ألصق كود QR الطالب"
          className="input flex-1"
          dir="ltr"
        />
        <div className="flex gap-2">
          <QrCameraScanner onScan={checkInByQr} />
          <button type="submit" disabled={scanning} className="btn-primary shrink-0">
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل"}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {data.roster.map((r, i) => (
          <div
            key={r.student.id}
            className="stagger-item card flex items-center justify-between py-3"
            style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
          >
            <span className="font-semibold">{r.student.user.fullName}</span>
            <div className="flex items-center gap-2">
              {r.attendance ? (
                <StatusBadge status={r.attendance.status} />
              ) : (
                <span className="text-xs text-muted">لم يسجل بعد</span>
              )}
              <div className="flex gap-1">
                <button
                  onClick={() => markStatus(r.student.id, "PRESENT")}
                  className="rounded-lg bg-green-50 p-1.5 text-success transition-transform hover:scale-110 hover:bg-green-100 active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => markStatus(r.student.id, "LATE")}
                  className="rounded-lg bg-amber-50 p-1.5 text-warning transition-transform hover:scale-110 hover:bg-amber-100 active:scale-95"
                >
                  <Clock className="h-4 w-4" />
                </button>
                <button
                  onClick={() => markStatus(r.student.id, "ABSENT")}
                  className="rounded-lg bg-red-50 p-1.5 text-danger transition-transform hover:scale-110 hover:bg-red-100 active:scale-95"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Counter({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div>
      <p className={`text-xl font-bold tabular-nums ${className ?? ""}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "PRESENT" | "LATE" | "ABSENT" }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <Icon className="h-3.5 w-3.5" /> {config.label}
    </span>
  );
}
