"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, ClipboardCheck, Wallet, Menu } from "lucide-react";
import { MobileDrawer } from "@/components/dashboard/mobile-drawer";

const ITEMS = [
  { label: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
  { label: "الطلاب", href: "/students", icon: Users },
  { label: "الحضور", href: "/attendance/prepare", icon: ClipboardCheck },
  { label: "المالية", href: "/finance", icon: Wallet },
];

export function BottomNav({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur md:hidden">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                />
              )}
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted"
        >
          <Menu className="h-5 w-5" />
          المزيد
        </button>
      </nav>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} permissions={permissions} />
    </>
  );
}
