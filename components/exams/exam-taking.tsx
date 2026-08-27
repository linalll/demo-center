"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, CheckCircle2 } from "lucide-react";

type Question = {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
  text: string;
  marks: string;
  options: { id: string; text: string }[];
};
type ExamData = {
  exam: { id: string; name: string; durationMinutes: number; totalMarks: string; questions: Question[] };
  attempt: { id: string; status: string; startedAt: string; answers: { questionId: string; answerText: string | null; selectedOptionId: string | null }[] } | null;
  result: { score: string; totalMarks: string } | null;
};

export function ExamTaking({ examId }: { examId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<string, { text?: string; optionId?: string }>>({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/exams/${examId}/take`);
    const json: ExamData = await res.json();
    setData(json);

    if (json.result) {
      setSubmitted(true);
      return;
    }

    if (!json.attempt) {
      const startRes = await fetch(`/api/exams/${examId}/attempt`, { method: "POST" });
      const startJson = await startRes.json();
      json.attempt = startJson.attempt;
    }

    if (json.attempt) {
      const initial: Record<string, { text?: string; optionId?: string }> = {};
      for (const a of json.attempt.answers) {
        initial[a.questionId] = { text: a.answerText ?? undefined, optionId: a.selectedOptionId ?? undefined };
      }
      setAnswers(initial);

      const elapsedSec = (Date.now() - new Date(json.attempt.startedAt).getTime()) / 1000;
      const remaining = Math.max(0, json.exam.durationMinutes * 60 - elapsedSec);
      setSecondsLeft(Math.floor(remaining));
    }
  }, [examId]);

  useEffect(() => {
    // Fetch-on-mount: `load` performs the request and writes the result via setData.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const attemptId = data?.attempt?.id;

  const submit = useCallback(async () => {
    if (!attemptId || submitted) return;
    setSubmitted(true);
    const res = await fetch(`/api/exams/attempts/${attemptId}/submit`, { method: "POST" });
    const json = await res.json();
    if (res.ok) {
      toast.success(json.needsManualGrading ? "تم تسليم الامتحان — بانتظار تصحيح المدرس" : "تم تسليم الامتحان وتصحيحه تلقائيًا");
      router.refresh();
    }
  }, [attemptId, submitted, router]);

  useEffect(() => {
    if (secondsLeft === null || submitted) return;
    if (secondsLeft <= 0) {
      // Auto-submit when the timer hits zero.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, submitted, submit]);

  async function saveAnswer(questionId: string, patch: { text?: string; optionId?: string }) {
    setAnswers((a) => ({ ...a, [questionId]: patch }));
    if (!attemptId) return;
    await fetch(`/api/exams/attempts/${attemptId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answerText: patch.text, selectedOptionId: patch.optionId }),
    });
  }

  const timeLabel = useMemo(() => {
    if (secondsLeft === null) return "--:--";
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  if (!data) return <div className="skeleton h-64 w-full" />;

  if (data.result) {
    return (
      <div className="card max-w-md text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <p className="mt-3 font-bold">تم تسليم هذا الامتحان بالفعل</p>
        <p className="mt-1 text-2xl font-bold text-primary">{data.result.score} / {data.result.totalMarks}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="card max-w-md text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <p className="mt-3 font-bold">تم تسليم الامتحان بنجاح</p>
      </div>
    );
  }

  const questions = data.exam.questions;
  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <p className="font-bold">{data.exam.name}</p>
        <span className="flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-sm font-bold text-primary-dark">
          <Clock className="h-4 w-4" /> {timeLabel}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-primary transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
      </div>
      <p className="text-sm text-muted">{answeredCount} من {questions.length} تمت الإجابة عليها</p>

      {q && (
        <div className="card">
          <p className="mb-4 text-sm text-muted">سؤال {current + 1} من {questions.length} · {q.marks} درجة</p>
          <p className="mb-4 font-semibold">{q.text}</p>

          {(q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
                    answers[q.id]?.optionId === opt.id ? "border-primary bg-primary-light" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id]?.optionId === opt.id}
                    onChange={() => saveAnswer(q.id, { optionId: opt.id })}
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          )}

          {(q.type === "SHORT_ANSWER" || q.type === "ESSAY") && (
            <textarea
              className="input"
              rows={q.type === "ESSAY" ? 6 : 2}
              value={answers[q.id]?.text ?? ""}
              onChange={(e) => saveAnswer(q.id, { text: e.target.value })}
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button disabled={current === 0} onClick={() => setCurrent((c) => c - 1)} className="btn-secondary disabled:opacity-40">
          السابق
        </button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">
            التالي
          </button>
        ) : (
          <button onClick={submit} className="btn-primary">
            تسليم الامتحان
          </button>
        )}
      </div>
    </div>
  );
}
