import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/handler";
import { db } from "@/lib/db";
import { DEFAULT_TEMPLATES } from "@/lib/services/whatsapp/templates";

export const GET = withAuth(async ({ user }) => {
  const overrides = await db.messageTemplate.findMany({ where: { centerId: user.centerId, language: "ar" } });
  const overrideMap = new Map(overrides.map((o) => [o.key, o.content]));

  const templates = Object.entries(DEFAULT_TEMPLATES).map(([key, defaultContent]) => ({
    key,
    content: overrideMap.get(key) ?? defaultContent,
    isCustomized: overrideMap.has(key),
  }));

  return NextResponse.json({ templates });
}, "settings.manage");

const updateSchema = z.object({ key: z.string(), content: z.string().min(1) });

export const PUT = withAuth(async ({ user, req }) => {
  const body = updateSchema.parse(await req.json());
  const template = await db.messageTemplate.upsert({
    where: { centerId_key_language: { centerId: user.centerId, key: body.key, language: "ar" } },
    update: { content: body.content },
    create: { centerId: user.centerId, key: body.key, language: "ar", content: body.content },
  });
  return NextResponse.json({ template });
}, "settings.manage");
