// Central registry of every permission key in the system.
// Roles and per-user overrides (UserPermission) reference these keys.

export const PERMISSION_GROUPS = {
  students: ["view", "create", "edit", "delete"],
  parents: ["view", "create", "edit", "delete"],
  teachers: ["view", "create", "edit", "delete"],
  assistants: ["view", "create", "edit", "delete"],
  subjects: ["view", "create", "edit", "delete"],
  groups: ["view", "create", "edit", "delete"],
  schedules: ["view", "create", "edit", "delete"],
  attendance: ["view", "create", "edit"],
  nfc: ["view", "program"],
  exams: ["view", "create", "edit", "delete", "grade"],
  finance: ["view", "create", "edit"],
  reports: ["view"],
  notifications: ["view", "create"],
  users: ["manage"],
  settings: ["manage"],
  audit: ["view"],
} as const;

export type PermissionGroup = keyof typeof PERMISSION_GROUPS;

export const ALL_PERMISSIONS: string[] = Object.entries(PERMISSION_GROUPS).flatMap(
  ([group, actions]) => actions.map((action) => `${group}.${action}`),
);

export const ROLE_KEYS = {
  ADMIN: "admin",
  ASSISTANT: "assistant",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
} as const;

// Default permission sets granted to built-in roles at seed time.
// Admin implicitly has everything (checked in code), so it's not listed here.
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLE_KEYS.ASSISTANT]: [
    "students.view",
    "students.create",
    "students.edit",
    "attendance.view",
    "attendance.create",
    "attendance.edit",
    "nfc.view",
    "nfc.program",
    "groups.view",
    "schedules.view",
    "notifications.view",
  ],
  [ROLE_KEYS.TEACHER]: [
    "students.view",
    "groups.view",
    "schedules.view",
    "attendance.view",
    "attendance.create",
    "exams.view",
    "exams.create",
    "exams.edit",
    "exams.grade",
  ],
  [ROLE_KEYS.STUDENT]: ["exams.view"],
  [ROLE_KEYS.PARENT]: [],
};
