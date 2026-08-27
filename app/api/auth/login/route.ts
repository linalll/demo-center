import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { loginWithPassword } from "@/lib/services/auth.service";
import { errorResponse } from "@/lib/api/handler";

export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());
    const user = await loginWithPassword(body);
    return NextResponse.json({ ok: true, user: { id: user.id, fullName: user.fullName, phone: user.phone } });
  } catch (err) {
    return errorResponse(err);
  }
}
