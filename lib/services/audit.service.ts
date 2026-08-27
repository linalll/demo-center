import { headers } from "next/headers";
import { db } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";

/** system.md #40 — every sensitive mutation should leave a trace of who did what. */
export const AuditLogger = {
  async log(user: CurrentUser, action: string, entity: string, entityId?: string, meta?: Record<string, unknown>) {
    const h = await headers().catch(() => null);
    await db.auditLog.create({
      data: {
        centerId: user.centerId,
        userId: user.id,
        action,
        entity,
        entityId,
        meta: meta as never,
        ip: h?.get("x-forwarded-for") ?? undefined,
        device: h?.get("user-agent") ?? undefined,
      },
    });
  },
};
