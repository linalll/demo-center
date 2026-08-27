"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, GraduationCap } from "lucide-react";

type Grade = { id: string; name: string };
type Stage = { id: string; name: string; grades: Grade[] };

export function StagesManager() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [newStageName, setNewStageName] = useState("");
  const [newGradeNames, setNewGradeNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/stages");
    const data = await res.json();
    setStages(data.stages ?? []);
  }

  useEffect(() => {
    // Fetch-on-mount: `load` performs the request and writes the result via setStages.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function addStage(e: React.FormEvent) {
    e.preventDefault();
    if (!newStageName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStageName }),
      });
      if (!res.ok) {
        toast.error("تعذر إضافة المرحلة");
        return;
      }
      setNewStageName("");
      toast.success("تم إضافة المرحلة");
      load();
    } finally {
      setLoading(false);
    }
  }

  async function addGrade(stageId: string) {
    const name = newGradeNames[stageId]?.trim();
    if (!name) return;
    const res = await fetch(`/api/stages/${stageId}/grades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      toast.error("تعذر إضافة الصف");
      return;
    }
    setNewGradeNames((n) => ({ ...n, [stageId]: "" }));
    toast.success("تم إضافة الصف");
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addStage} className="card flex items-center gap-2">
        <input
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="اسم المرحلة الدراسية (مثال: المرحلة الابتدائية)"
          className="input"
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          إضافة مرحلة
        </button>
      </form>

      {stages.map((stage) => (
        <div key={stage.id} className="card">
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <p className="font-bold">{stage.name}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stage.grades.map((g) => (
              <span key={g.id} className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark">
                {g.name}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={newGradeNames[stage.id] ?? ""}
              onChange={(e) => setNewGradeNames((n) => ({ ...n, [stage.id]: e.target.value }))}
              placeholder="اسم الصف (مثال: الصف الثالث)"
              className="input"
            />
            <button onClick={() => addGrade(stage.id)} className="btn-secondary shrink-0">
              إضافة صف
            </button>
          </div>
        </div>
      ))}

      {stages.length === 0 && <p className="text-sm text-muted">لا توجد مراحل دراسية بعد</p>}
    </div>
  );
}
