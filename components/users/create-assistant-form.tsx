"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PermissionGrid } from "@/components/users/permission-grid";

export function CreateAssistantForm() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/permissions").then((r) => r.json()).then((d) => setPermissions(d.permissions ?? []));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, password, permissionKeys: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر إضافة الموظف");
        return;
      }
      toast.success("تم إضافة الموظف بنجاح");
      router.push("/users");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="card grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">الاسم الكامل *</span>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">رقم الهاتف *</span>
          <input className="input text-left" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">كلمة السر *</span>
          <input
            type="password"
            className="input text-left"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
      </div>

      <div className="card">
        <p className="mb-3 font-bold">الصلاحيات</p>
        <PermissionGrid allPermissions={permissions} selected={selected} onChange={setSelected} />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الموظف"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          إلغاء
        </button>
      </div>
    </form>
  );
}
