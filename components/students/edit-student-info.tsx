"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, X } from "lucide-react";

type Grade = { id: string; name: string; stage: { name: string } };

type StudentInfo = {
  id: string;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | null;
  school: string | null;
  gradeId: string | null;
  address: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
};

export function EditStudentInfo({ student }: { student: StudentInfo }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : "",
    gender: student.gender ?? "",
    school: student.school ?? "",
    gradeId: student.gradeId ?? "",
    address: student.address ?? "",
    guardianName: student.guardianName ?? "",
    guardianPhone: student.guardianPhone ?? "",
  });

  useEffect(() => {
    if (open && grades.length === 0) {
      fetch("/api/grades").then((r) => r.json()).then((d) => setGrades(d.grades ?? []));
    }
  }, [open, grades.length]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر حفظ البيانات");
        return;
      }
      toast.success("تم استكمال بيانات الطالب بنجاح");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary">
        <Pencil className="h-4 w-4" /> استكمال البيانات
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card animate-enter space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold">استكمال بيانات الطالب</p>
        <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
        <Field label="رقم ولي الأمر">
          <input
            className="input text-left"
            dir="ltr"
            value={form.guardianPhone}
            onChange={(e) => update("guardianPhone", e.target.value)}
          />
        </Field>
        <Field label="العنوان">
          <input className="input" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </Field>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          إلغاء
        </button>
      </div>
    </form>
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
