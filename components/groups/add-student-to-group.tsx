"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";

type StudentHit = { id: string; user: { fullName: string; phone: string }; studentCode: string };

export function AddStudentToGroup({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<StudentHit[]>([]);
  const [searching, setSearching] = useState(false);

  async function search(value: string) {
    setQ(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/students?q=${encodeURIComponent(value)}&pageSize=5`);
      const data = await res.json();
      setResults(data.items ?? []);
    } finally {
      setSearching(false);
    }
  }

  async function addStudent(studentId: string) {
    const res = await fetch(`/api/groups/${groupId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "تعذر إضافة الطالب");
      return;
    }
    toast.success("تم إضافة الطالب إلى المجموعة");
    setQ("");
    setResults([]);
    router.refresh();
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => search(e.target.value)}
          placeholder="ابحث عن طالب لإضافته..."
          className="input pe-10"
        />
      </div>
      {q.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface shadow-lg">
          {searching && <p className="p-3 text-sm text-muted">جاري البحث...</p>}
          {!searching && results.length === 0 && <p className="p-3 text-sm text-muted">لا نتائج</p>}
          {results.map((s) => (
            <button
              key={s.id}
              onClick={() => addStudent(s.id)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-background"
            >
              <span>{s.user.fullName} <span className="text-muted" dir="ltr">({s.user.phone})</span></span>
              <UserPlus className="h-4 w-4 text-primary" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
