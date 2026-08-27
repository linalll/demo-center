import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getEffectivePermissions } from "@/lib/permissions/check";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: { key: user.role.key, name: user.role.name },
      permissions: Array.from(getEffectivePermissions(user)),
    },
  });
}
