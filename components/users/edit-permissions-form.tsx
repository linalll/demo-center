"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PermissionGrid } from "@/components/users/permission-grid";

export function EditPermissionsForm({ userId, initialSelected }: { userId: string; initialSelected: string[] }) {
  const router = useRouter();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/permissions").then((r) => r.json()).then((d) => setPermissions(d.permissions ?? []));
  }, []);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionKeys: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "تعذر حفظ الصلاحيات");
        return;
      }
      toast.success("تم تحديث الصلاحيات بنجاح");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <PermissionGrid allPermissions={permissions} selected={selected} onChange={setSelected} />
      </div>
      <button onClick={save} disabled={loading} className="btn-primary">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الصلاحيات"}
      </button>
    </div>
  );
}
