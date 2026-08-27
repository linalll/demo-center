import Link from "next/link";
import { Users, ClipboardCheck, Nfc, Layers, Wallet, Award } from "lucide-react";
import type { CurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions/check";

const QUICK_LINKS = [
  { permission: "students.view", href: "/students", label: "الطلاب", icon: Users },
  { permission: "attendance.view", href: "/attendance/prepare", label: "تحضير الحصص", icon: ClipboardCheck },
  { permission: "nfc.view", href: "/nfc", label: "كروت NFC", icon: Nfc },
  { permission: "groups.view", href: "/groups", label: "المجموعات", icon: Layers },
  { permission: "finance.view", href: "/finance", label: "المالية", icon: Wallet },
  { permission: "exams.view", href: "/exams", label: "الامتحانات", icon: Award },
];

export function AssistantDashboard({ user }: { user: CurrentUser }) {
  const links = QUICK_LINKS.filter((l) => hasPermission(user, l.permission));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">أهلًا، {user.fullName}</h1>
        <p className="mt-1 text-muted">هذه الأقسام المتاحة لك حسب صلاحياتك</p>
      </div>

      {links.length === 0 ? (
        <div className="card py-12 text-center text-sm text-muted">لم يتم منحك أي صلاحيات بعد — تواصل مع الإدارة</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="card flex flex-col items-center gap-2 py-6 text-center card-interactive stagger-item">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-light text-primary">
                <l.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold">{l.label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
