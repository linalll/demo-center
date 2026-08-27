"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export function StudentPaymentForm({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, amount: Number(amount), method, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر تسجيل الدفعة");
        return;
      }
      toast.success("تم تسجيل الدفعة وإرسال إشعار لولي الأمر");
      setAmount("");
      setNote("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <p className="font-bold">تسجيل دفعة جديدة</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="المبلغ"
          className="input"
          required
        />
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
          <option value="CASH">نقدًا</option>
          <option value="TRANSFER">تحويل بنكي</option>
          <option value="WALLET">محفظة إلكترونية</option>
        </select>
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظة (اختياري)" className="input" />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> تسجيل الدفعة</>}
      </button>
    </form>
  );
}
