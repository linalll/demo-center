"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "reset">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر إرسال رمز التحقق");
        return;
      }
      setDevCode(data.devCode ?? null);
      setStep("reset");
      toast.success("تم إرسال رمز التحقق");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر تحديث كلمة السر");
        return;
      }
      toast.success("تم تحديث كلمة السر وتسجيل الدخول");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (step === "phone") {
    return (
      <form onSubmit={requestCode} className="space-y-4">
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
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إرسال رمز التحقق"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={resetPassword} className="space-y-4">
      <p className="text-sm text-muted">تم إرسال رمز تحقق مكون من 6 أرقام إلى {phone}</p>
      {devCode && (
        <p className="rounded-lg bg-primary-light px-3 py-2 text-sm text-primary-dark">
          (وضع التجربة) الرمز: <span dir="ltr" className="font-bold">{devCode}</span>
        </p>
      )}
      <Field label="رمز التحقق">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          dir="ltr"
          className="input text-center tracking-[0.5em]"
          maxLength={6}
          required
        />
      </Field>
      <Field label="كلمة السر الجديدة">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          dir="ltr"
          className="input text-left"
          minLength={8}
          required
        />
      </Field>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحديث كلمة السر"}
      </button>
      <button type="button" onClick={() => setStep("phone")} className="w-full text-sm text-muted hover:text-foreground">
        تعديل رقم الهاتف
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
