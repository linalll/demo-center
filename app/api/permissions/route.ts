import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { ALL_PERMISSIONS } from "@/lib/permissions/definitions";

export const GET = withAuth(async () => {
  return NextResponse.json({ permissions: ALL_PERMISSIONS });
}, "users.manage");
