"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "@/components/dashboard/nav-items";
import { Logo } from "@/components/brand/logo";

function can(permissions: string[], required?: string) {
  if (!required) return true;
  return permissions.includes("*") || permissions.includes(required);
}

export function Sidebar({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-e border-border bg-surface md:flex md:flex-col">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
        <Logo size={40} />
        <div>
          <p className="font-bold leading-none">سنتر أنمكا</p>
          <p className="text-xs text-muted leading-none mt-1">ANMKA Center</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.filter((item) => can(permissions, item.permission)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                  active ? "text-primary-dark" : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-primary-light"
                  />
                )}
                <item.icon className="relative h-[18px] w-[18px]" />
                <span className="relative">{item.label}</span>
              </Link>
              {item.children && active && (
                <div className="me-4 mt-1 space-y-0.5 border-e-2 border-primary-light pe-3">
                  {item.children
                    .filter((c) => can(permissions, c.permission))
                    .map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          pathname === child.href ? "font-semibold text-primary" : "text-muted hover:text-foreground"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
