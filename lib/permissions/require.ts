import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions/check";

/**
 * Server-page guard: redirects unauthenticated visitors to /login and
 * 404s authenticated users lacking the permission. Sidebar link visibility
 * alone is not access control (system.md #43) — every permission-gated
 * page must also enforce it here.
 */
export async function requirePagePermission(permission: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, permission)) notFound();
  return user;
}
