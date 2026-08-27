"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Center = {
  id: string;
  name: string;
  nameEn: string;
  phone: string | null;
  address: string | null;
  workingHours: string | null;
  currency: string;
  defaultBillingModel: string;
  gracePeriodMinutes: number;
  lateAfterMinutes: number;
  autoAbsenceEnabled: boolean;
  attendanceNotificationsEnabled: boolean;
  whatsappEnabled: boolean;
};

export function CenterSettingsForm({ center }: { center: Center }) {
  const router = useRouter();
  const [form, setForm] = useState(center);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof Center>(key: K, value: Center[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/center", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر حفظ الإعدادات");
        return;
      }
      toast.success("تم حفظ الإعدادات بنجاح");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h2 className="font-bold">بيانات السنتر</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم السنتر (عربي)">
            <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="اسم السنتر (إنجليزي)">
            <input className="input" dir="ltr" value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} />
          </Field>
          <Field label="رقم الهاتف">
            <input className="input" dir="ltr" value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field label="العنوان">
            <input className="input" value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} />
          </Field>
          <Field label="ساعات العمل">
            <input className="input" value={form.workingHours ?? ""} onChange={(e) => update("workingHours", e.target.value)} placeholder="مثال: 10ص - 10م" />
          </Field>
          <Field label="العملة">
            <input className="input" value={form.currency} onChange={(e) => update("currency", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold">إعدادات الحضور</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="فترة السماح (دقائق)">
            <input type="number" min="0" className="input" value={form.gracePeriodMinutes} onChange={(e) => update("gracePeriodMinutes", Number(e.target.value))} />
          </Field>
          <Field label="اعتبار الطالب متأخرًا بعد (دقائق)">
            <input type="number" min="0" className="input" value={form.lateAfterMinutes} onChange={(e) => update("lateAfterMinutes", Number(e.target.value))} />
          </Field>
        </div>
        <ToggleRow label="غياب تلقائي بعد انتهاء فترة السماح" checked={form.autoAbsenceEnabled} onChange={(v) => update("autoAbsenceEnabled", v)} />
        <ToggleRow label="إرسال إشعار عند تسجيل الحضور/الغياب" checked={form.attendanceNotificationsEnabled} onChange={(v) => update("attendanceNotificationsEnabled", v)} />
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold">إعدادات المالية</h2>
        <Field label="نظام الفوترة الافتراضي">
          <select className="input" value={form.defaultBillingModel} onChange={(e) => update("defaultBillingModel", e.target.value)}>
            <option value="MONTHLY">اشتراك شهري</option>
            <option value="PER_SESSION">بالحصة</option>
            <option value="CUSTOM">مخصص</option>
          </select>
        </Field>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold">إعدادات واتساب</h2>
        <ToggleRow label="تفعيل إشعارات واتساب" checked={form.whatsappEnabled} onChange={(v) => update("whatsappEnabled", v)} />
        <p className="text-xs text-muted">
          بيانات اعتماد WhatsApp Business API (Access Token, Phone Number ID) تُضبط من متغيرات البيئة (.env) لأسباب أمنية ولا تُعرض هنا.
        </p>
      </div>

      <button onClick={save} disabled={loading} className="btn-primary">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الإعدادات"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-border"}`}
      >
        <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition ${checked ? "-translate-x-0.5" : "-translate-x-5"}`} />
      </button>
    </label>
  );
}
