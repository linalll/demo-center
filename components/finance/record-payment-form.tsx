"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";

type StudentHit = { id: string; user: { fullName: string; phone: string } };

export function RecordPaymentForm() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<StudentHit[]>([]);
  const [selected, setSelected] = useState<StudentHit | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !amount) return;
    setLoading(true);
    try {
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selected.id, amount: Number(amount), method, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر تسجيل الدفعة");
        return;
      }
      toast.success("تم تسجيل الدفعة بنجاح");
      setSelected(null);
      setQ("");
      setAmount("");
      setNote("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <p className="font-bold">تسجيل دفعة</p>
      <div className="relative">
        <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => search(e.target.value)} placeholder="ابحث عن الطالب" className="input pe-10" />
      </div>
      {results.length > 0 && !selected && (
        <div className="space-y-1 rounded-xl border border-border p-1">
          {results.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => {
                setSelected(s);
                setResults([]);
                setQ(s.user.fullName);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-background"
            >
              {s.user.fullName}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="المبلغ" className="input" />
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
          <option value="CASH">نقدًا</option>
          <option value="TRANSFER">تحويل بنكي</option>
          <option value="WALLET">محفظة إلكترونية</option>
        </select>
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظة (اختياري)" className="input" />
      <button type="submit" disabled={!selected || loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الدفعة"}
      </button>
    </form>
  );
}
