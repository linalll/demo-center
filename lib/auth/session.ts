import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { signSessionToken, verifySessionToken } from "@/lib/auth/jwt";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "anmka_session";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const h = await headers();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  const session = await db.authSession.create({
    data: {
      userId,
      tokenHash: "", // set below once we know the sid
      expiresAt,
      userAgent: h.get("user-agent") ?? undefined,
      ip: h.get("x-forwarded-for") ?? undefined,
    },
  });

  const token = await signSessionToken({ sub: userId, sid: session.id }, SESSION_TTL_SECONDS);
  await db.authSession.update({ where: { id: session.id }, data: { tokenHash: hashToken(token) } });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const payload = await verifySessionToken(token);
    if (payload) {
      await db.authSession.update({
        where: { id: payload.sid },
        data: { revokedAt: new Date() },
      }).catch(() => undefined);
    }
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const session = await db.authSession.findUnique({ where: { id: payload.sid } });
  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (session.tokenHash !== hashToken(token)) return null;

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
      permissionOverrides: { include: { permission: true } },
    },
  });

  if (!user || user.status !== "ACTIVE") return null;
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
