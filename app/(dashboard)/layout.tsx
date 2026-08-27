import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getEffectivePermissions } from "@/lib/permissions/check";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { PageTransition } from "@/components/dashboard/page-transition";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const permissions = Array.from(getEffectivePermissions(user));

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar permissions={permissions} />
      <div className="flex min-h-full flex-1 flex-col">
        <Topbar fullName={user.fullName} roleName={user.role.name} permissions={permissions} />
        <main className="flex-1 bg-background p-4 pb-20 sm:p-6 md:pb-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav permissions={permissions} />
    </div>
  );
}
