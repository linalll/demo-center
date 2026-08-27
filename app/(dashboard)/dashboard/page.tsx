import { Users, GraduationCap, Layers, CalendarClock, CheckCircle2, Clock, XCircle, Award, Wallet, Receipt } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdminDashboardStats } from "@/lib/services/dashboard.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ROLE_KEYS } from "@/lib/permissions/definitions";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { ParentDashboard } from "@/components/dashboard/parent-dashboard";
import { AssistantDashboard } from "@/components/dashboard/assistant-dashboard";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;

  if (user.role.key === ROLE_KEYS.TEACHER) {
    return <TeacherDashboard userId={user.id} fullName={user.fullName} />;
  }

  if (user.role.key === ROLE_KEYS.STUDENT) {
    return <StudentDashboard userId={user.id} fullName={user.fullName} />;
  }

  if (user.role.key === ROLE_KEYS.PARENT) {
    const sp = await searchParams;
    return <ParentDashboard userId={user.id} fullName={user.fullName} selectedStudentId={sp.child} />;
  }

  if (user.role.key === ROLE_KEYS.ASSISTANT) {
    return <AssistantDashboard user={user} />;
  }

  const stats = await getAdminDashboardStats(user.centerId);

  return (
    <div className="space-y-8">
      <div className="animate-enter">
        <h1 className="text-2xl font-bold tracking-tight">أهلًا بك، {user.fullName} 👋</h1>
        <p className="mt-1 text-muted">نظرة عامة على أداء السنتر اليوم</p>
      </div>

      <QuickActions />

      <div>
        <h2 className="mb-3 text-lg font-bold">نظرة عامة</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="إجمالي الطلاب" value={stats.totalStudents} icon={Users} />
          <StatCard label="المدرسين" value={stats.totalTeachers} icon={GraduationCap} />
          <StatCard label="المجموعات" value={stats.totalGroups} icon={Layers} />
          <StatCard label="حصص اليوم" value={stats.sessionsToday} icon={CalendarClock} />
          <StatCard label="حاضرين اليوم" value={stats.presentToday} icon={CheckCircle2} tone="success" />
          <StatCard label="متأخرين اليوم" value={stats.lateToday} icon={Clock} tone="warning" />
          <StatCard label="غائبين اليوم" value={stats.absentToday} icon={XCircle} tone="danger" />
          <StatCard label="امتحانات قادمة" value={stats.upcomingExams} icon={Award} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">المالية هذا الشهر</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="المحصل" value={`${stats.financial.totalCollected} ج.م`} icon={Wallet} tone="success" />
          <StatCard label="المصروفات" value={`${stats.financial.totalExpenses} ج.م`} icon={Receipt} tone="danger" />
          <StatCard label="صافي الربح" value={`${stats.financial.netProfit} ج.م`} icon={Wallet} />
          <StatCard label="إجمالي المديونيات" value={`${stats.financial.totalDebt} ج.م`} icon={Receipt} tone="warning" />
        </div>
      </div>
    </div>
  );
}
