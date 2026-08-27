import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";

export const GET = withAuth(async ({ user }) => {
  const cards = await db.nfcCard.findMany({
    where: { student: { user: { centerId: user.centerId } } },
    include: { student: { include: { user: true } } },
    orderBy: { assignedDate: "desc" },
    take: 30,
  });
  return NextResponse.json({ cards });
}, "nfc.view");
