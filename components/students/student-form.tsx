"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Grade = { id: string; name: string; stage: { name: string } };

export function StudentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    gradeId: "",
    guardianName: "",
    guardianPhone: "",
    parentPhone: "",
    school: "",
    address: "",
  });

  useEffect(() => {
    fetch("/api/grades").then((r) => r.json()).then((d) => setGrades(d.grades ?? []));
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر إضافة الطالب");
        return;
      }
      toast.success("تم إضافة الطالب بنجاح");
      router.push(`/students/${data.student.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="الاسم الكامل" required>
          <input className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
        </Field>
        <Field label="رقم هاتف الطالب" required>
          <input
            className="input text-left"
            dir="ltr"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
        </Field>
        <Field label="كلمة سر الطالب" required>
          <input
            type="password"
            className="input text-left"
            dir="ltr"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            minLength={8}
            required
          />
        </Field>
        <Field label="تاريخ الميلاد">
          <input type="date" className="input" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
        </Field>
        <Field label="الجنس">
          <select className="input" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
            <option value="">غير محدد</option>
            <option value="MALE">ذكر</option>
            <option value="FEMALE">أنثى</option>
          </select>
        </Field>
        <Field label="المرحلة الدراسية / الصف">
          <select className="input" value={form.gradeId} onChange={(e) => update("gradeId", e.target.value)}>
            <option value="">اختر الصف</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>{g.stage.name} — {g.name}</option>
            ))}
          </select>
        </Field>
        <Field label="المدرسة">
          <input className="input" value={form.school} onChange={(e) => update("school", e.target.value)} />
        </Field>
        <Field label="اسم ولي الأمر">
          <input className="input" value={form.guardianName} onChange={(e) => update("guardianName", e.target.value)} />
        </Field>
        <Field label="رقم ولي الأمر (لإنشاء حساب متابعة)">
          <input
            className="input text-left"
            dir="ltr"
            value={form.parentPhone}
            onChange={(e) => update("parentPhone", e.target.value)}
          />
        </Field>
        <Field label="العنوان">
          <input className="input" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </Field>
      </div>

      {grades.length === 0 && (
        <p className="text-xs text-muted">
          لا توجد مراحل دراسية بعد — يمكنك إضافتها من{" "}
          <a href="/subjects/stages" className="font-semibold text-primary">المراحل الدراسية والصفوف</a>.
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الطالب"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          إلغاء
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}
