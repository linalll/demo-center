"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

const AUDIENCES = [
  { value: "ALL_STUDENTS", label: "جميع الطلاب" },
  { value: "ALL_PARENTS", label: "جميع أولياء الأمور" },
  { value: "TEACHERS", label: "المدرسين" },
  { value: "STAFF", label: "الموظفين" },
];

export function BroadcastForm() {
  const router = useRouter();
  const [audience, setAudience] = useState("ALL_STUDENTS");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, audience: { type: audience } }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر إرسال الإشعار");
        return;
      }
      toast.success(`تم إرسال الإشعار إلى ${data.sentTo} مستخدم`);
      setTitle("");
      setBody("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <p className="font-bold">إرسال إشعار جديد</p>
      <select value={audience} onChange={(e) => setAudience(e.target.value)} className="input">
        {AUDIENCES.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الإشعار" className="input" required />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="نص الرسالة" className="input" rows={3} required />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> إرسال</>}
      </button>
    </form>
  );
}
