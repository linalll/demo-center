import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Layers,
  GraduationCap,
  BookOpen,
  Award,
  Wallet,
  BarChart3,
  BellRing,
  ShieldCheck,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  children?: { label: string; href: string; permission?: string }[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "الطلاب",
    href: "/students",
    icon: Users,
    permission: "students.view",
    children: [
      { label: "كل الطلاب", href: "/students" },
      { label: "إضافة طالب", href: "/students/new", permission: "students.create" },
    ],
  },
  {
    label: "الحضور والانصراف",
    href: "/attendance/prepare",
    icon: ClipboardCheck,
    permission: "attendance.view",
    children: [
      { label: "تحضير حصة", href: "/attendance/prepare" },
      { label: "كروت NFC", href: "/nfc", permission: "nfc.view" },
    ],
  },
  { label: "المجموعات", href: "/groups", icon: Layers, permission: "groups.view" },
  { label: "المدرسين", href: "/teachers", icon: GraduationCap, permission: "teachers.view" },
  {
    label: "المواد والكورسات",
    href: "/subjects",
    icon: BookOpen,
    permission: "subjects.view",
    children: [
      { label: "المواد", href: "/subjects" },
      { label: "المراحل الدراسية والصفوف", href: "/subjects/stages" },
    ],
  },
  {
    label: "الامتحانات",
    href: "/exams",
    icon: Award,
    permission: "exams.view",
    children: [
      { label: "كل الامتحانات", href: "/exams" },
      { label: "إنشاء امتحان", href: "/exams/new", permission: "exams.create" },
    ],
  },
  {
    label: "المالية",
    href: "/finance",
    icon: Wallet,
    permission: "finance.view",
    children: [
      { label: "نظرة عامة", href: "/finance" },
      { label: "المدفوعات", href: "/finance/payments" },
      { label: "المصروفات", href: "/finance/expenses" },
      { label: "المديونيات", href: "/finance/debts" },
    ],
  },
  { label: "التقارير", href: "/reports", icon: BarChart3, permission: "reports.view" },
  { label: "الإشعارات", href: "/notifications", icon: BellRing },
  { label: "المستخدمين والصلاحيات", href: "/users", icon: ShieldCheck, permission: "users.manage" },
  {
    label: "الإعدادات",
    href: "/settings",
    icon: Settings,
    permission: "settings.manage",
    children: [
      { label: "الإعدادات العامة", href: "/settings" },
      { label: "سجل العمليات", href: "/audit-log", permission: "audit.view" },
    ],
  },
];
