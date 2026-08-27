import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { registerWithPassword } from "@/lib/services/auth.service";
import { errorResponse } from "@/lib/api/handler";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());
    const user = await registerWithPassword(body);
    return NextResponse.json({ ok: true, user: { id: user.id, fullName: user.fullName, phone: user.phone } });
  } catch (err) {
    return errorResponse(err);
  }
}
