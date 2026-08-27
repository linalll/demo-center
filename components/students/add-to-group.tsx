"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Plus, Loader2 } from "lucide-react";

type Group = { id: string; name: string; price: string; billingModel: string; subject: { name: string } };

const BILLING_LABELS: Record<string, string> = {
  MONTHLY: "شهري",
  PER_SESSION: "بالحصة",
  CUSTOM: "مخصص",
};

export function AddToGroup({ studentId, existingGroupIds }: { studentId: string; existingGroupIds: string[] }) {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/groups").then((r) => r.json()).then((d) => setGroups(d.groups ?? []));
  }, []);

  const available = groups.filter(
    (g) => !existingGroupIds.includes(g.id) && (q === "" || g.name.includes(q) || g.subject.name.includes(q)),
  );

  async function addToGroup(groupId: string) {
    setAdding(groupId);
    try {
      const res = await fetch(`/api/groups/${groupId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر إضافة الطالب للمجموعة");
        return;
      }
      toast.success("تم إضافة الطالب للمجموعة — وتحديث المستحقات المالية تلقائيًا");
      router.refresh();
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="card">
      <p className="mb-3 font-bold">إضافة إلى مجموعة أخرى</p>
      <div className="relative mb-3">
        <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن مجموعة..." className="input pe-10" />
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {available.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
            <div>
              <p className="font-semibold">{g.name}</p>
              <p className="text-xs text-muted">
                {g.subject.name} · {g.price} ج.م ({BILLING_LABELS[g.billingModel]})
              </p>
            </div>
            <button
              onClick={() => addToGroup(g.id)}
              disabled={adding === g.id}
              className="flex items-center gap-1 rounded-lg bg-primary-light px-3 py-1.5 text-sm font-semibold text-primary-dark hover:bg-primary hover:text-white"
            >
              {adding === g.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              إضافة
            </button>
          </div>
        ))}
        {available.length === 0 && <p className="text-sm text-muted">لا توجد مجموعات أخرى متاحة</p>}
      </div>
    </div>
  );
}
