import type { CurrentUser } from "@/lib/auth/session";
import { ROLE_KEYS } from "@/lib/permissions/definitions";

/**
 * Effective permission = role permissions, with per-user overrides applied
 * last (an explicit deny always wins over a role grant, and an explicit
 * grant always wins over the role not having it — system.md #7).
 * Admin bypasses the whole check and always passes.
 */
export function getEffectivePermissions(user: CurrentUser): Set<string> {
  if (user.role.key === ROLE_KEYS.ADMIN) return new Set(["*"]);

  const perms = new Set<string>();
  for (const rp of user.role.permissions) perms.add(rp.permission.key);
  for (const up of user.permissionOverrides) {
    if (up.granted) perms.add(up.permission.key);
    else perms.delete(up.permission.key);
  }
  return perms;
}

export function hasPermission(user: CurrentUser, permissionKey: string): boolean {
  if (user.role.key === ROLE_KEYS.ADMIN) return true;
  return getEffectivePermissions(user).has(permissionKey);
}

export function assertPermission(user: CurrentUser, permissionKey: string) {
  if (!hasPermission(user, permissionKey)) {
    throw new PermissionError(permissionKey);
  }
}

export class PermissionError extends Error {
  constructor(public permissionKey: string) {
    super(`Missing permission: ${permissionKey}`);
    this.name = "PermissionError";
  }
}
