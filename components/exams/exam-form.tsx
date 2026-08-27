"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

type Question = {
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
  text: string;
  marks: number;
  options: { text: string; isCorrect: boolean }[];
};

const QUESTION_TYPES: { value: Question["type"]; label: string }[] = [
  { value: "MULTIPLE_CHOICE", label: "اختيار من متعدد" },
  { value: "TRUE_FALSE", label: "صح أو خطأ" },
  { value: "SHORT_ANSWER", label: "إجابة قصيرة" },
  { value: "ESSAY", label: "مقالي" },
];

function emptyQuestion(type: Question["type"] = "MULTIPLE_CHOICE"): Question {
  return {
    type,
    text: "",
    marks: 1,
    options:
      type === "MULTIPLE_CHOICE"
        ? [{ text: "", isCorrect: true }, { text: "", isCorrect: false }]
        : type === "TRUE_FALSE"
          ? [{ text: "صح", isCorrect: true }, { text: "خطأ", isCorrect: false }]
          : [],
  };
}

export function ExamForm() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string; teacherId: string; subjectId: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [examType, setExamType] = useState<"ONLINE" | "OFFLINE">("OFFLINE");
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetch("/api/subjects").then((r) => r.json()).then((d) => setSubjects(d.subjects ?? []));
    fetch("/api/groups").then((r) => r.json()).then((d) => setGroups(d.groups ?? []));
  }, []);

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  function updateQuestion(i: number, patch: Partial<Question>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    setLoading(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subjectId,
          groupId,
          teacherId: group.teacherId,
          date,
          durationMinutes: Number(durationMinutes),
          totalMarks: totalMarks || 100,
          examType,
          questions: examType === "ONLINE" ? questions : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر إنشاء الامتحان");
        return;
      }
      toast.success("تم إنشاء الامتحان بنجاح");
      router.push(`/exams/${data.exam.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className="card space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">اسم الامتحان *</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">المادة *</span>
            <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              <option value="">اختر المادة</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">المجموعة *</span>
            <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)} required>
              <option value="">اختر المجموعة</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">التاريخ والوقت *</span>
            <input type="datetime-local" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">مدة الامتحان (دقيقة)</span>
            <input type="number" min="1" className="input" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-semibold">نوع الامتحان</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setExamType("OFFLINE")} className={`btn-secondary ${examType === "OFFLINE" ? "!bg-primary !text-white !border-primary" : ""}`}>
              ورقي (رصد يدوي)
            </button>
            <button type="button" onClick={() => setExamType("ONLINE")} className={`btn-secondary ${examType === "ONLINE" ? "!bg-primary !text-white !border-primary" : ""}`}>
              إلكتروني
            </button>
          </div>
        </div>
      </div>

      {examType === "ONLINE" && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">الأسئلة (الدرجة الكلية: {totalMarks || 0})</h2>
            <button
              type="button"
              onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}
              className="flex items-center gap-1 text-sm font-semibold text-primary"
            >
              <Plus className="h-4 w-4" /> إضافة سؤال
            </button>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <select
                  className="input"
                  value={q.type}
                  onChange={(e) => updateQuestion(i, emptyQuestion(e.target.value as Question["type"]))}
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="input w-24"
                  value={q.marks}
                  onChange={(e) => updateQuestion(i, { marks: Number(e.target.value) })}
                  placeholder="الدرجة"
                />
                <button type="button" onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))} className="text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input
                className="input"
                placeholder="نص السؤال"
                value={q.text}
                onChange={(e) => updateQuestion(i, { text: e.target.value })}
              />
              {(q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") && (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${i}`}
                        checked={opt.isCorrect}
                        onChange={() =>
                          updateQuestion(i, { options: q.options.map((o, idx) => ({ ...o, isCorrect: idx === oi })) })
                        }
                      />
                      <input
                        className="input"
                        value={opt.text}
                        disabled={q.type === "TRUE_FALSE"}
                        onChange={(e) =>
                          updateQuestion(i, {
                            options: q.options.map((o, idx) => (idx === oi ? { ...o, text: e.target.value } : o)),
                          })
                        }
                      />
                      {q.type === "MULTIPLE_CHOICE" && q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => updateQuestion(i, { options: q.options.filter((_, idx) => idx !== oi) })}
                          className="text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {q.type === "MULTIPLE_CHOICE" && (
                    <button
                      type="button"
                      onClick={() => updateQuestion(i, { options: [...q.options, { text: "", isCorrect: false }] })}
                      className="text-sm font-semibold text-primary"
                    >
                      + إضافة اختيار
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الامتحان"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          إلغاء
        </button>
      </div>
    </form>
  );
}
