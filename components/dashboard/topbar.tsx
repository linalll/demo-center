"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Bell, Menu } from "lucide-react";
import { MobileDrawer } from "@/components/dashboard/mobile-drawer";

export function Topbar({
  fullName,
  roleName,
  permissions,
}: {
  fullName: string;
  roleName: string;
  permissions: string[];
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-background hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold">{fullName}</p>
            <p className="text-xs text-muted">{roleName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-muted transition hover:bg-background hover:text-danger sm:px-3"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} permissions={permissions} />
    </>
  );
}
