"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function TeacherForm() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/subjects").then((r) => r.json()).then((d) => setSubjects(d.subjects ?? []));
  }, []);

  function toggleSubject(id: string) {
    setSubjectIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, subjectIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر إضافة المدرس");
        return;
      }
      toast.success("تم إضافة المدرس بنجاح");
      router.push(`/teachers/${data.teacher.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-xl space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">الاسم الكامل *</span>
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">رقم الهاتف *</span>
        <input className="input text-left" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <span className="mt-1 block text-xs text-muted">
          المدرس هيقدر يفعّل كلمة السر بنفسه لاحقًا من صفحة تسجيل الدخول (نسيت كلمة السر)
        </span>
      </label>
      <div>
        <span className="mb-1.5 block text-sm font-semibold">المواد</span>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => toggleSubject(s.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                subjectIds.includes(s.id) ? "bg-primary text-white" : "bg-background text-muted hover:text-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
          {subjects.length === 0 && <p className="text-sm text-muted">أضف مواد أولًا من صفحة المواد</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ المدرس"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          إلغاء
        </button>
      </div>
    </form>
  );
}
