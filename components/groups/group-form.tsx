"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

const DAYS = [
  { value: "SATURDAY", label: "السبت" },
  { value: "SUNDAY", label: "الأحد" },
  { value: "MONDAY", label: "الإثنين" },
  { value: "TUESDAY", label: "الثلاثاء" },
  { value: "WEDNESDAY", label: "الأربعاء" },
  { value: "THURSDAY", label: "الخميس" },
  { value: "FRIDAY", label: "الجمعة" },
];

type Option = { id: string; name?: string; user?: { fullName: string } };

export function GroupForm() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [price, setPrice] = useState("0");
  const [billingModel, setBillingModel] = useState("MONTHLY");
  const [maxStudents, setMaxStudents] = useState("");
  const [slots, setSlots] = useState([{ dayOfWeek: "SATURDAY", startTime: "17:00", endTime: "18:30" }]);

  useEffect(() => {
    fetch("/api/subjects").then((r) => r.json()).then((d) => setSubjects(d.subjects ?? []));
    fetch("/api/teachers").then((r) => r.json()).then((d) => setTeachers(d.teachers ?? []));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subjectId,
          teacherId,
          price: Number(price),
          billingModel,
          maxStudents: maxStudents ? Number(maxStudents) : undefined,
          scheduleSlots: slots,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر إنشاء المجموعة");
        return;
      }
      toast.success("تم إنشاء المجموعة بنجاح");
      router.push(`/groups/${data.group.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-5">
      <Field label="اسم المجموعة" required>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="مثال: Math Grade 3 - Group A" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="المادة" required>
          <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
            <option value="">اختر المادة</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
        <Field label="المدرس" required>
          <select className="input" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
            <option value="">اختر المدرس</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.user?.fullName}</option>
            ))}
          </select>
        </Field>
        <Field label="سعر الاشتراك">
          <input className="input" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="نظام الفوترة">
          <select className="input" value={billingModel} onChange={(e) => setBillingModel(e.target.value)}>
            <option value="MONTHLY">اشتراك شهري</option>
            <option value="PER_SESSION">بالحصة</option>
            <option value="CUSTOM">مخصص</option>
          </select>
        </Field>
        <Field label="الحد الأقصى للطلاب">
          <input className="input" type="number" min="1" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} />
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold">مواعيد الحصص</span>
          <button
            type="button"
            onClick={() => setSlots((s) => [...s, { dayOfWeek: "SATURDAY", startTime: "17:00", endTime: "18:30" }])}
            className="flex items-center gap-1 text-sm font-semibold text-primary"
          >
            <Plus className="h-4 w-4" /> إضافة موعد
          </button>
        </div>
        <div className="space-y-2">
          {slots.map((slot, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                className="input"
                value={slot.dayOfWeek}
                onChange={(e) => setSlots((s) => s.map((x, idx) => (idx === i ? { ...x, dayOfWeek: e.target.value } : x)))}
              >
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <input
                type="time"
                className="input"
                value={slot.startTime}
                onChange={(e) => setSlots((s) => s.map((x, idx) => (idx === i ? { ...x, startTime: e.target.value } : x)))}
              />
              <input
                type="time"
                className="input"
                value={slot.endTime}
                onChange={(e) => setSlots((s) => s.map((x, idx) => (idx === i ? { ...x, endTime: e.target.value } : x)))}
              />
              {slots.length > 1 && (
                <button type="button" onClick={() => setSlots((s) => s.filter((_, idx) => idx !== i))} className="text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ المجموعة"}
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
