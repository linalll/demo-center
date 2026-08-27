"use client";

const PERMISSION_GROUPS_LABELS: Record<string, string> = {
  students: "الطلاب",
  parents: "أولياء الأمور",
  teachers: "المدرسين",
  assistants: "الموظفين",
  subjects: "المواد",
  groups: "المجموعات",
  schedules: "الجداول",
  attendance: "الحضور",
  nfc: "كروت NFC",
  exams: "الامتحانات",
  finance: "المالية",
  reports: "التقارير",
  notifications: "الإشعارات",
  users: "المستخدمين",
  settings: "الإعدادات",
  audit: "سجل العمليات",
};

const ACTION_LABELS: Record<string, string> = {
  view: "عرض",
  create: "إضافة",
  edit: "تعديل",
  delete: "حذف",
  manage: "إدارة",
  grade: "تصحيح",
  program: "برمجة",
};

const GROUP_ORDER = [
  "students",
  "parents",
  "teachers",
  "assistants",
  "subjects",
  "groups",
  "schedules",
  "attendance",
  "nfc",
  "exams",
  "finance",
  "reports",
  "notifications",
  "users",
  "settings",
  "audit",
];

export function PermissionGrid({
  allPermissions,
  selected,
  onChange,
}: {
  allPermissions: string[];
  selected: string[];
  onChange: (keys: string[]) => void;
}) {
  const byGroup = new Map<string, string[]>();
  for (const key of allPermissions) {
    const [group] = key.split(".");
    byGroup.set(group, [...(byGroup.get(group) ?? []), key]);
  }

  function toggle(key: string) {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {GROUP_ORDER.filter((g) => byGroup.has(g)).map((group) => (
        <div key={group} className="rounded-xl border border-border p-3">
          <p className="mb-2 text-sm font-bold">{PERMISSION_GROUPS_LABELS[group] ?? group}</p>
          <div className="flex flex-wrap gap-1.5">
            {byGroup.get(group)!.map((key) => {
              const action = key.split(".")[1];
              const active = selected.includes(key);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggle(key)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    active ? "bg-primary text-white" : "bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {ACTION_LABELS[action] ?? action}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
