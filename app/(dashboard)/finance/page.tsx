import Link from "next/link";
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from "date-fns";
import { Wallet, Receipt, TrendingUp, Users, CreditCard } from "lucide-react";
import { requirePagePermission } from "@/lib/permissions/require";
import { getCenterFinancialSummary } from "@/lib/services/finance.service";
import { StatCard } from "@/components/dashboard/stat-card";

const RANGES: Record<string, string> = { today: "اليوم", week: "هذا الأسبوع", month: "هذا الشهر", all: "الكل" };

export default async function FinanceOverviewPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const user = await requirePagePermission("finance.view");

  const sp = await searchParams;
  const range = sp.range ?? "month";
  const now = new Date();
  const from =
    range === "today" ? startOfDay(now) : range === "week" ? startOfWeek(now) : range === "month" ? startOfMonth(now) : undefined;

  const summary = await getCenterFinancialSummary(user.centerId, from, from ? endOfDay(now) : undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">المالية</h1>
          <p className="mt-1 text-muted">نظرة عامة على الوضع المالي للسنتر</p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/payments" className="btn-secondary">
            <CreditCard className="h-4 w-4" /> المدفوعات
          </Link>
          <Link href="/finance/expenses" className="btn-secondary">
            <Receipt className="h-4 w-4" /> المصروفات
          </Link>
          <Link href="/finance/debts" className="btn-secondary">
            <Users className="h-4 w-4" /> المديونيات
          </Link>
        </div>
      </div>

      <div className="flex gap-2">
        {Object.entries(RANGES).map(([key, label]) => (
          <Link
            key={key}
            href={`/finance?range=${key}`}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              range === key ? "bg-primary text-white" : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="المحصل" value={`${summary.totalCollected} ج.م`} icon={Wallet} tone="success" />
        <StatCard label="المصروفات" value={`${summary.totalExpenses} ج.م`} icon={Receipt} tone="danger" />
        <StatCard label="صافي الربح" value={`${summary.netProfit} ج.م`} icon={TrendingUp} />
        <StatCard label="طلاب عليهم مديونية" value={summary.studentsWithDebt} icon={Users} tone="warning" />
      </div>

      <div className="card">
        <p className="text-sm text-muted">إجمالي المديونيات المستحقة</p>
        <p className="mt-1 text-3xl font-bold text-danger">{summary.totalDebt.toString()} ج.م</p>
      </div>
    </div>
  );
}
