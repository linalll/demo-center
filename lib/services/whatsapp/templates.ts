import { db } from "@/lib/db";

// Default Arabic templates (system.md #20/#21/#27) — editable per-center via
// the MessageTemplate table; these are the fallback when no override exists.
export const DEFAULT_TEMPLATES: Record<string, string> = {
  "attendance.present":
    "تم تسجيل حضور {{student_name}} في حصة {{subject_name}} اليوم الساعة {{time}}.",
  "attendance.late":
    "تم تسجيل حضور {{student_name}} متأخرًا في حصة {{subject_name}} اليوم الساعة {{time}}.",
  "attendance.absent": "لم يتم تسجيل حضور {{student_name}} في حصة {{subject_name}} اليوم.",
  "exam.reminder": "تذكير: امتحان {{subject_name}} لمجموعة {{group_name}} {{date}} الساعة {{time}}.",
  "exam.result": "تم تسجيل نتيجة {{student_name}} في امتحان {{subject_name}}: {{amount}} من {{remaining_amount}}.",
  "payment.confirmation": "تم استلام دفعة بمبلغ {{amount}} من ولي أمر {{student_name}}. المتبقي: {{remaining_amount}}.",
  "debt.reminder": "تذكير بمديونية متبقية قدرها {{remaining_amount}} على {{student_name}}.",
  general: "{{message}}",
};

export async function renderTemplate(
  centerId: string,
  key: string,
  variables: Record<string, string | number>,
) {
  const override = await db.messageTemplate.findUnique({
    where: { centerId_key_language: { centerId, key, language: "ar" } },
  });

  let content = override?.content ?? DEFAULT_TEMPLATES[key] ?? "";
  for (const [k, v] of Object.entries(variables)) {
    content = content.replaceAll(`{{${k}}}`, String(v));
  }
  return content;
}
