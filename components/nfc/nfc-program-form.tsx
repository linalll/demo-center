"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, Nfc, CheckCircle2, Loader2 } from "lucide-react";

type StudentHit = { id: string; user: { fullName: string; phone: string }; studentCode: string };

export function NfcProgramForm() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<StudentHit[]>([]);
  const [selected, setSelected] = useState<StudentHit | null>(null);
  const [cardUid, setCardUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function search(value: string) {
    setQ(value);
    setSelected(null);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/students?q=${encodeURIComponent(value)}&pageSize=5`);
    const data = await res.json();
    setResults(data.items ?? []);
  }

  async function programCard(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !cardUid) return;
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/nfc/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selected.id, cardUid, device: "Web Reader" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر ربط الكارت");
        return;
      }
      toast.success("تم ربط الكارت بالطالب بنجاح");
      setSuccess(true);
      setCardUid("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-xl space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold">1. اختر الطالب</p>
        <div className="relative">
          <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => search(e.target.value)} placeholder="ابحث بالاسم أو الهاتف" className="input pe-10" />
        </div>
        {results.length > 0 && !selected && (
          <div className="mt-2 space-y-1 rounded-xl border border-border p-1">
            {results.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelected(s);
                  setResults([]);
                  setQ(s.user.fullName);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-background"
              >
                <span>{s.user.fullName}</span>
                <span className="text-muted" dir="ltr">{s.user.phone}</span>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <p className="mt-2 flex items-center gap-2 rounded-xl bg-primary-light px-3 py-2 text-sm text-primary-dark">
            <CheckCircle2 className="h-4 w-4" /> تم اختيار: {selected.user.fullName} ({selected.studentCode})
          </p>
        )}
      </div>

      <form onSubmit={programCard} className="space-y-3">
        <p className="text-sm font-semibold">2. مرّر الكارت على جهاز القراءة أو أدخل رقمه يدويًا</p>
        <div className="flex items-center gap-3">
          <Nfc className="h-5 w-5 text-primary" />
          <input
            value={cardUid}
            onChange={(e) => setCardUid(e.target.value)}
            placeholder="Card UID"
            dir="ltr"
            className="input flex-1"
          />
        </div>
        <button type="submit" disabled={!selected || !cardUid || loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "برمجة الكارت"}
        </button>
        {success && (
          <p className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> تم ربط الكارت بالطالب بنجاح
          </p>
        )}
      </form>
    </div>
  );
}
