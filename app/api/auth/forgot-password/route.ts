import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/lib/services/auth.service";
import { errorResponse } from "@/lib/api/handler";

export async function POST(req: Request) {
  try {
    const body = forgotPasswordSchema.parse(await req.json());
    const { expiresAt, code } = await requestPasswordReset(body.phone);
    return NextResponse.json({
      ok: true,
      expiresAt,
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
