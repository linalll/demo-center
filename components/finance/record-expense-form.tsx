"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["إيجار", "رواتب", "فواتير", "صيانة", "أدوات ومستلزمات", "أخرى"];

export function RecordExpenseForm() {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount: Number(amount), description }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر تسجيل المصروف");
        return;
      }
      toast.success("تم تسجيل المصروف");
      setAmount("");
      setDescription("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <p className="font-bold">تسجيل مصروف</p>
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="المبلغ" className="input" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف (اختياري)" className="input" />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ المصروف"}
      </button>
    </form>
  );
}
