import { describe, it, expect } from "vitest";
import { hasPermission, getEffectivePermissions } from "@/lib/permissions/check";
import { ROLE_KEYS } from "@/lib/permissions/definitions";
import type { CurrentUser } from "@/lib/auth/session";

function makeUser(overrides: Partial<CurrentUser>): CurrentUser {
  return {
    role: { key: ROLE_KEYS.ASSISTANT, permissions: [] },
    permissionOverrides: [],
    ...overrides,
  } as CurrentUser;
}

function grant(key: string) {
  return { permission: { key } };
}

describe("permission system (system.md #7)", () => {
  it("Admin always has every permission, even ones never granted explicitly", () => {
    const admin = makeUser({ role: { key: ROLE_KEYS.ADMIN, permissions: [] } as never });
    expect(hasPermission(admin, "finance.delete-that-does-not-exist")).toBe(true);
  });

  it("a non-admin without the permission is denied", () => {
    const assistant = makeUser({});
    expect(hasPermission(assistant, "finance.view")).toBe(false);
  });

  it("role-granted permissions are honored", () => {
    const assistant = makeUser({
      role: { key: ROLE_KEYS.ASSISTANT, permissions: [grant("students.view")] } as never,
    });
    expect(hasPermission(assistant, "students.view")).toBe(true);
  });

  it("a per-user override can grant a permission the role doesn't have", () => {
    const assistant = makeUser({
      role: { key: ROLE_KEYS.ASSISTANT, permissions: [] } as never,
      permissionOverrides: [{ granted: true, permission: { key: "finance.view" } }] as never,
    });
    expect(hasPermission(assistant, "finance.view")).toBe(true);
  });

  it("an explicit deny override wins over a role grant (system.md #7 — Admin sets each Assistant's permissions)", () => {
    const assistant = makeUser({
      role: { key: ROLE_KEYS.ASSISTANT, permissions: [grant("students.view")] } as never,
      permissionOverrides: [{ granted: false, permission: { key: "students.view" } }] as never,
    });
    expect(hasPermission(assistant, "students.view")).toBe(false);
    expect(getEffectivePermissions(assistant).has("students.view")).toBe(false);
  });
});
