import Link from "next/link";
import { requirePagePermission } from "@/lib/permissions/require";
import { db } from "@/lib/db";
import { CenterSettingsForm } from "@/components/settings/center-settings-form";
import { TemplatesEditor } from "@/components/settings/templates-editor";

const TABS = [
  { key: "general", label: "عام" },
  { key: "templates", label: "قوالب واتساب" },
] as const;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requirePagePermission("settings.manage");

  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? sp.tab! : "general";

  const center = await db.center.findUniqueOrThrow({ where: { id: user.centerId } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">الإعدادات</h1>
        <p className="mt-1 text-muted">إعدادات السنتر، الحضور، المالية، وواتساب</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/settings?tab=${t.key}`}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "general" && <CenterSettingsForm center={center} />}
      {tab === "templates" && <TemplatesEditor />}
    </div>
  );
}
