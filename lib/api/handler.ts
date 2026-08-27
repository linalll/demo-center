import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import { assertPermission, PermissionError } from "@/lib/permissions/check";

type Handler = (ctx: { user: CurrentUser; req: Request }) => Promise<NextResponse>;

/**
 * Wraps a Route Handler with: auth requirement, an optional permission
 * check enforced server-side (system.md #43 — never trust the frontend
 * alone), and consistent error → HTTP status mapping.
 */
export function withAuth(handler: Handler, permission?: string) {
  return async (req: Request) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
      }
      if (permission) assertPermission(user, permission);
      return await handler({ user, req });
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function errorResponse(err: unknown) {
  if (err instanceof PermissionError) {
    return NextResponse.json({ error: "FORBIDDEN", permission: err.permissionKey }, { status: 403 });
  }
  if (err instanceof ZodError) {
    return NextResponse.json({ error: "VALIDATION_ERROR", issues: err.issues }, { status: 422 });
  }
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.code, message: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}
