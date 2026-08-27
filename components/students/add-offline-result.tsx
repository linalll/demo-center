"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Award } from "lucide-react";

type ExamOption = {
  id: string;
  name: string;
  subjectName: string;
  totalMarks: string;
  existingScore: string | null;
};

export function AddOfflineResult({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [examId, setExamId] = useState("");
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/students/${studentId}/exams`)
      .then((r) => r.json())
      .then((d) => setExams(d.exams ?? []));
  }, [studentId]);

  const selectedExam = exams.find((e) => e.id === examId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examId || !score) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/${examId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, score: Number(score) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر تسجيل النتيجة");
        return;
      }
      toast.success("تم تسجيل نتيجة الامتحان وإرسال إشعار لولي الأمر");
      setExamId("");
      setScore("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (exams.length === 0) {
    return (
      <div className="card">
        <p className="mb-1 flex items-center gap-2 font-bold"><Award className="h-4 w-4 text-primary" /> تسجيل نتيجة امتحان</p>
        <p className="text-sm text-muted">لا توجد امتحانات لمجموعات هذا الطالب بعد</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <p className="flex items-center gap-2 font-bold"><Award className="h-4 w-4 text-primary" /> تسجيل نتيجة امتحان</p>
      <select value={examId} onChange={(e) => setExamId(e.target.value)} className="input" required>
        <option value="">اختر الامتحان</option>
        {exams.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name} — {e.subjectName} {e.existingScore ? `(مسجّل: ${e.existingScore})` : ""}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max={selectedExam ? Number(selectedExam.totalMarks) : undefined}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder={selectedExam ? `الدرجة من ${selectedExam.totalMarks}` : "الدرجة"}
          className="input"
          required
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
        </button>
      </div>
    </form>
  );
}
