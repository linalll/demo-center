"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Ban, Trash2, CheckCircle2, X, Loader2 } from "lucide-react";

type StudentRow = {
  id: string;
  studentCode: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  user: { fullName: string; phone: string };
  grade: { name: string } | null;
};

const STATUS_CONFIG = {
  ACTIVE: { label: "نشط", className: "bg-green-50 text-success" },
  INACTIVE: { label: "غير نشط", className: "bg-slate-100 text-muted" },
  SUSPENDED: { label: "معلّق", className: "bg-red-50 text-danger" },
} as const;

export function StudentsTable({ items }: { items: StudentRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const allSelected = items.length > 0 && selected.size === items.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(items.map((s) => s.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulkAction(action: "SUSPEND" | "DELETE" | "ACTIVATE") {
    if (selected.size === 0) return;
    if (action === "DELETE" && !window.confirm(`هل تريد حذف/تعطيل ${selected.size} طالب؟`)) return;

    setLoadingAction(action);
    try {
      const res = await fetch("/api/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: Array.from(selected), action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر تنفيذ العملية");
        return;
      }
      const labels = { SUSPEND: "تعليق", DELETE: "حذف/تعطيل", ACTIVATE: "تفعيل" };
      toast.success(`تم ${labels[action]} ${data.count} طالب`);
      setSelected(new Set());
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  function exportSelectionOrAll() {
    // Triggers a file download from the API route — not an app navigation.
    const ids = selected.size > 0 ? Array.from(selected) : items.map((s) => s.id);
    const link = document.createElement("a");
    link.href = `/api/students/export?ids=${ids.join(",")}`;
    link.click();
  }

  const selectionCount = selected.size;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-muted">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-border accent-primary" />
          تحديد الكل
        </label>
        <button onClick={exportSelectionOrAll} className="btn-secondary ms-auto">
          <Download className="h-4 w-4" /> تصدير Excel {selectionCount > 0 ? `(${selectionCount})` : ""}
        </button>
      </div>

      <AnimatePresence>
        {selectionCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 overflow-hidden rounded-xl bg-primary-light px-4 py-3 text-sm font-semibold text-primary-dark"
          >
            <span>{selectionCount} محدد</span>
            <button
              onClick={() => runBulkAction("ACTIVATE")}
              disabled={!!loadingAction}
              className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-success shadow-sm hover:bg-green-50"
            >
              {loadingAction === "ACTIVATE" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              تفعيل
            </button>
            <button
              onClick={() => runBulkAction("SUSPEND")}
              disabled={!!loadingAction}
              className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-warning shadow-sm hover:bg-amber-50"
            >
              {loadingAction === "SUSPEND" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
              تعليق
            </button>
            <button
              onClick={() => runBulkAction("DELETE")}
              disabled={!!loadingAction}
              className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-danger shadow-sm hover:bg-red-50"
            >
              {loadingAction === "DELETE" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              حذف
            </button>
            <button onClick={() => setSelected(new Set())} className="ms-auto text-primary-dark/70 hover:text-primary-dark">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop table */}
      <div className="card table-wrap hidden p-0 md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background text-right text-muted">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-border accent-primary" />
              </th>
              <th className="px-4 py-3 font-semibold">الاسم</th>
              <th className="px-4 py-3 font-semibold">الكود</th>
              <th className="px-4 py-3 font-semibold">الهاتف</th>
              <th className="px-4 py-3 font-semibold">الصف</th>
              <th className="px-4 py-3 font-semibold">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className={`border-b border-border transition-colors last:border-0 hover:bg-background ${selected.has(s.id) ? "bg-primary-light/40" : ""}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggleOne(s.id)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/students/${s.id}`} className="font-semibold hover:text-primary">
                    {s.user.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted" dir="ltr">{s.studentCode}</td>
                <td className="px-4 py-3 text-muted" dir="ltr">{s.user.phone}</td>
                <td className="px-4 py-3 text-muted">{s.grade?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {items.map((s, i) => (
          <div
            key={s.id}
            className={`stagger-item card flex items-center gap-3 p-4 ${selected.has(s.id) ? "border-primary/40 bg-primary-light/30" : ""}`}
            style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
          >
            <input
              type="checkbox"
              checked={selected.has(s.id)}
              onChange={() => toggleOne(s.id)}
              className="h-4 w-4 shrink-0 rounded border-border accent-primary"
            />
            <Link href={`/students/${s.id}`} className="min-w-0 flex-1">
              <p className="truncate font-semibold">{s.user.fullName}</p>
              <p className="text-xs text-muted" dir="ltr">{s.user.phone} · {s.studentCode}</p>
            </Link>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: StudentRow["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${cfg.className}`}>{cfg.label}</span>;
}
