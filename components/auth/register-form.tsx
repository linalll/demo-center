"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, GraduationCap, Users } from "lucide-react";

type Role = "PARENT" | "STUDENT";

const ROLE_OPTIONS: { value: Role; label: string; icon: typeof Users }[] = [
  { value: "PARENT", label: "ولي أمر", icon: Users },
  { value: "STUDENT", label: "طالب", icon: GraduationCap },
];

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("PARENT");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر إنشاء الحساب");
        return;
      }
      toast.success("تم إنشاء الحساب بنجاح");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <span className="mb-1.5 block text-sm font-semibold text-foreground">نوع الحساب</span>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                role === opt.value
                  ? "border-primary bg-primary-light text-primary-dark"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Field label="الاسم الكامل">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="مثال: محمد أحمد" className="input" required />
      </Field>
      <Field label="رقم الهاتف">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01xxxxxxxxx"
          dir="ltr"
          className="input text-left"
          required
        />
      </Field>
      <Field label="كلمة السر">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="ltr"
          className="input text-left"
          minLength={8}
          required
        />
        <span className="mt-1 block text-xs text-muted">8 أحرف على الأقل</span>
      </Field>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء حساب"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
