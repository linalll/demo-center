"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

type Template = { key: string; content: string; isCustomized: boolean };

const TEMPLATE_LABELS: Record<string, string> = {
  "attendance.present": "إشعار الحضور",
  "attendance.late": "إشعار التأخير",
  "attendance.absent": "إشعار الغياب",
  "exam.reminder": "تذكير امتحان",
  "exam.result": "إعلان نتيجة",
  "payment.confirmation": "تأكيد دفعة",
  "debt.reminder": "تذكير مديونية",
  general: "رسالة عامة",
};

export function TemplatesEditor() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/templates").then((r) => r.json()).then((d) => setTemplates(d.templates ?? []));
  }, []);

  async function save(key: string, content: string) {
    setSaving(key);
    try {
      const res = await fetch("/api/settings/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, content }),
      });
      if (!res.ok) {
        toast.error("تعذر حفظ القالب");
        return;
      }
      toast.success("تم حفظ القالب");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-3">
      {templates.map((t) => (
        <div key={t.key} className="card space-y-2">
          <p className="text-sm font-bold">{TEMPLATE_LABELS[t.key] ?? t.key}</p>
          <textarea
            className="input"
            rows={2}
            defaultValue={t.content}
            onBlur={(e) => e.target.value !== t.content && save(t.key, e.target.value)}
          />
          <p className="text-xs text-muted">
            المتغيرات المتاحة: {"{{student_name}} {{parent_name}} {{subject_name}} {{group_name}} {{date}} {{time}} {{amount}} {{remaining_amount}}"}
          </p>
          {saving === t.key && <p className="flex items-center gap-1 text-xs text-primary"><Loader2 className="h-3 w-3 animate-spin" /> جاري الحفظ...</p>}
        </div>
      ))}
      {templates.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-muted"><Save className="h-4 w-4" /> جاري تحميل القوالب...</p>
      )}
    </div>
  );
}
