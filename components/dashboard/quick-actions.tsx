import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, UserPlus, Wallet, BellRing, Layers, Nfc } from "lucide-react";

const ACTIONS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/attendance/prepare", label: "تحضير الطلاب", icon: ClipboardCheck },
  { href: "/students/new", label: "إضافة طالب", icon: UserPlus },
  { href: "/finance/payments", label: "تسجيل دفعة", icon: Wallet },
  { href: "/groups/new", label: "إنشاء مجموعة", icon: Layers },
  { href: "/nfc", label: "برمجة كارت NFC", icon: Nfc },
  { href: "/notifications", label: "إرسال إشعار", icon: BellRing },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">إجراءات سريعة</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ACTIONS.map((action, i) => (
          <Link
            key={action.href}
            href={action.href}
            style={{ animationDelay: `${i * 40}ms` }}
            className="stagger-item group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/15 active:scale-95"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-light text-primary transition-all duration-200 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
              <action.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold leading-tight">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
