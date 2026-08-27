import Link from "next/link";
import { notFound } from "next/navigation";
import { QrCode as QrCodeIcon, Nfc, Phone, School, Printer, IdCard, Wallet, CalendarCheck, Award } from "lucide-react";
import { getStudentProfile } from "@/lib/services/student.service";
import { getStudentBalance } from "@/lib/services/finance.service";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessStudent } from "@/lib/permissions/student-access";
import { AddToGroup } from "@/components/students/add-to-group";
import { EditStudentInfo } from "@/components/students/edit-student-info";
import { AddOfflineResult } from "@/components/students/add-offline-result";
import { StudentPaymentForm } from "@/components/students/student-payment-form";
import { db } from "@/lib/db";

const TABS = [
  { key: "overview", label: "نظرة عامة" },
  { key: "attendance", label: "الحضور" },
  { key: "schedule", label: "الجدول" },
  { key: "groups", label: "المجموعات" },
  { key: "results", label: "النتائج" },
  { key: "payments", label: "المدفوعات" },
  { key: "notifications", label: "الإشعارات" },
  { key: "nfc", label: "كارت NFC" },
] as const;

export default async function StudentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? sp.tab! : "overview";

  const user = await getCurrentUser();
  if (!user || !(await canAccessStudent(user, id))) notFound();

  const student = await getStudentProfile(id);
  const balance = await getStudentBalance(id);

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-light text-2xl font-bold text-primary-dark">
            {student.user.fullName.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{student.user.fullName}</h1>
            <p className="text-sm text-muted" dir="ltr">
              {student.studentCode} · {student.user.phone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="font-bold text-primary">{balance.totalPaid.toString()} ج.م</p>
              <p className="text-muted">مدفوع</p>
            </div>
            <div className="text-center">
              <p className={`font-bold ${balance.remaining.gt(0) ? "text-danger" : "text-success"}`}>
                {balance.remaining.toString()} ج.م
              </p>
              <p className="text-muted">المتبقي</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/students/${id}/receipt`} className="btn-secondary" title="طباعة إيصال">
              <Printer className="h-4 w-4" />
            </Link>
            <Link href={`/students/${id}/id-card`} className="btn-secondary" title="بطاقة الطالب">
              <IdCard className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/students/${id}?tab=${t.key}`}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "overview" && <OverviewTab student={student} balance={balance} />}
      {tab === "attendance" && <AttendanceTab studentId={id} />}
      {tab === "schedule" && <ScheduleTab student={student} />}
      {tab === "groups" && <GroupsTab student={student} />}
      {tab === "results" && <ResultsTab studentId={id} />}
      {tab === "payments" && <PaymentsTab studentId={id} balance={balance} />}
      {tab === "notifications" && <NotificationsTab userId={student.userId} />}
      {tab === "nfc" && <NfcTab student={student} />}
    </div>
  );
}

type StudentProfile = Awaited<ReturnType<typeof getStudentProfile>>;

async function OverviewTab({
  student,
  balance,
}: {
  student: StudentProfile;
  balance: Awaited<ReturnType<typeof getStudentBalance>>;
}) {
  const [attendanceCounts, results] = await Promise.all([
    db.attendance.groupBy({ by: ["status"], where: { studentId: student.id }, _count: true }),
    db.examResult.findMany({ where: { studentId: student.id } }),
  ]);

  const present = attendanceCounts.find((a) => a.status === "PRESENT")?._count ?? 0;
  const late = attendanceCounts.find((a) => a.status === "LATE")?._count ?? 0;
  const absent = attendanceCounts.find((a) => a.status === "ABSENT")?._count ?? 0;
  const totalAttendance = present + late + absent;
  const attendanceRate = totalAttendance > 0 ? Math.round(((present + late) / totalAttendance) * 100) : null;

  const examAverage = results.length
    ? Math.round((results.reduce((sum, r) => sum + (Number(r.score) / Number(r.totalMarks)) * 100, 0) / results.length) * 10) / 10
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">البيانات الأساسية</h2>
            <EditStudentInfo
              student={{
                id: student.id,
                dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString() : null,
                gender: student.gender,
                school: student.school,
                gradeId: student.gradeId,
                address: student.address,
                guardianName: student.guardianName,
                guardianPhone: student.guardianPhone,
              }}
            />
          </div>
          <InfoRow icon={Phone} label="ولي الأمر" value={`${student.guardianName ?? "—"} · ${student.guardianPhone ?? "—"}`} />
          <InfoRow icon={School} label="المدرسة" value={student.school ?? "—"} />
          <InfoRow icon={School} label="الصف" value={student.grade?.name ?? "—"} />
          <InfoRow
            icon={CalendarCheck}
            label="تاريخ الميلاد"
            value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("ar-EG") : "—"}
          />
          <InfoRow icon={Phone} label="العنوان" value={student.address ?? "—"} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat icon={Wallet} label="إجمالي المستحق" value={`${balance.totalCharges.toString()} ج.م`} />
          <MiniStat icon={Wallet} label="مدفوع" value={`${balance.totalPaid.toString()} ج.م`} tone="success" />
          <MiniStat
            icon={Wallet}
            label="المتبقي عليه"
            value={`${balance.remaining.toString()} ج.م`}
            tone={balance.remaining.gt(0) ? "danger" : "success"}
          />
          <MiniStat icon={Award} label="معدل الامتحانات" value={examAverage !== null ? `${examAverage}%` : "—"} />
        </div>

        <div className="card">
          <h2 className="mb-3 font-bold">الحضور والغياب</h2>
          {totalAttendance === 0 ? (
            <p className="text-sm text-muted">لا يوجد سجل حضور بعد</p>
          ) : (
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-success">{present}</p>
                <p className="text-xs text-muted">حاضر</p>
              </div>
              <div>
                <p className="text-xl font-bold text-warning">{late}</p>
                <p className="text-xs text-muted">متأخر</p>
              </div>
              <div>
                <p className="text-xl font-bold text-danger">{absent}</p>
                <p className="text-xs text-muted">غائب</p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{attendanceRate}%</p>
                <p className="text-xs text-muted">نسبة الحضور</p>
              </div>
            </div>
          )}
        </div>

        <AddOfflineResult studentId={student.id} />
      </div>

      <div className="space-y-6">
        <div className="card text-center">
          <QrCodeIcon className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 font-bold">QR Code</p>
          <p className="mt-1 break-all text-xs text-muted" dir="ltr">{student.qrCode}</p>
        </div>
        <StudentPaymentForm studentId={student.id} />
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "primary" | "success" | "danger";
}) {
  const toneClass = { primary: "text-primary", success: "text-success", danger: "text-danger" }[tone];
  return (
    <div className="card text-center">
      <Icon className={`mx-auto h-5 w-5 ${toneClass}`} />
      <p className={`mt-1.5 font-bold ${toneClass}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

async function AttendanceTab({ studentId }: { studentId: string }) {
  const records = await db.attendance.findMany({
    where: { studentId },
    include: { session: { include: { group: { include: { subject: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const STATUS_LABEL: Record<string, string> = { PRESENT: "حاضر", LATE: "متأخر", ABSENT: "غائب" };
  const STATUS_CLASS: Record<string, string> = {
    PRESENT: "bg-green-50 text-success",
    LATE: "bg-amber-50 text-warning",
    ABSENT: "bg-red-50 text-danger",
  };

  return (
    <div className="card p-0">
      {records.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted">لا يوجد سجل حضور بعد</p>
      ) : (
        <div className="divide-y divide-border">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-semibold">{r.session.group.subject.name} — {r.session.group.name}</p>
                <p className="text-xs text-muted">{new Date(r.session.date).toLocaleDateString("ar-EG")} · {r.session.startTime}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "الأحد",
  MONDAY: "الإثنين",
  TUESDAY: "الثلاثاء",
  WEDNESDAY: "الأربعاء",
  THURSDAY: "الخميس",
  FRIDAY: "الجمعة",
  SATURDAY: "السبت",
};

function ScheduleTab({ student }: { student: StudentProfile }) {
  return (
    <div className="card">
      {student.groupMemberships.length === 0 ? (
        <p className="text-sm text-muted">لا يوجد جدول — الطالب غير مسجل في أي مجموعة</p>
      ) : (
        <div className="space-y-3">
          {student.groupMemberships.map((m) => (
            <div key={m.groupId} className="rounded-xl border border-border px-4 py-3">
              <p className="font-semibold">{m.group.subject.name} — {m.group.name}</p>
              <p className="text-xs text-muted">{m.group.teacher.user.fullName}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.group.scheduleSlots.map((s) => (
                  <span key={s.id} className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark">
                    {DAY_LABELS[s.dayOfWeek]} {s.startTime} - {s.endTime}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const BILLING_LABELS: Record<string, string> = {
  MONTHLY: "شهري",
  PER_SESSION: "بالحصة",
  CUSTOM: "مخصص",
};

function GroupsTab({ student }: { student: StudentProfile }) {
  return (
    <div className="space-y-4">
      <div className="card">
        {student.groupMemberships.length === 0 ? (
          <p className="text-sm text-muted">لم يتم تسجيله في أي مجموعة بعد</p>
        ) : (
          <div className="space-y-2">
            {student.groupMemberships.map((m) => (
              <Link
                key={m.groupId}
                href={`/groups/${m.groupId}`}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-background"
              >
                <div>
                  <p className="font-semibold">{m.group.name}</p>
                  <p className="text-xs text-muted">{m.group.subject.name} · {m.group.teacher.user.fullName}</p>
                </div>
                <span className="text-xs font-semibold text-muted">
                  {m.group.price.toString()} ج.م · {BILLING_LABELS[m.group.billingModel]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <AddToGroup studentId={student.id} existingGroupIds={student.groupMemberships.map((m) => m.groupId)} />
    </div>
  );
}

async function ResultsTab({ studentId }: { studentId: string }) {
  const results = await db.examResult.findMany({
    where: { studentId },
    include: { exam: { include: { subject: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="card p-0">
      {results.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted">لا توجد نتائج امتحانات بعد</p>
      ) : (
        <div className="divide-y divide-border">
          {results.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-semibold">{r.exam.name}</p>
                <p className="text-xs text-muted">{r.exam.subject.name}</p>
              </div>
              <span className="font-bold text-primary">{r.score.toString()} / {r.totalMarks.toString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentsTab({ studentId, balance }: { studentId: string; balance: Awaited<ReturnType<typeof getStudentBalance>> }) {
  return <PaymentsList studentId={studentId} balance={balance} />;
}

async function PaymentsList({ studentId, balance }: { studentId: string; balance: Awaited<ReturnType<typeof getStudentBalance>> }) {
  const [payments, charges] = await Promise.all([
    db.payment.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } }),
    db.studentCharge.findMany({ where: { studentId }, include: { group: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-lg font-bold">{balance.totalCharges.toString()}</p>
            <p className="text-xs text-muted">إجمالي المستحق</p>
          </div>
          <div className="card text-center">
            <p className="text-lg font-bold text-success">{balance.totalPaid.toString()}</p>
            <p className="text-xs text-muted">مدفوع</p>
          </div>
          <div className="card text-center">
            <p className={`text-lg font-bold ${balance.remaining.gt(0) ? "text-danger" : "text-success"}`}>{balance.remaining.toString()}</p>
            <p className="text-xs text-muted">المتبقي</p>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 font-bold">المستحقات (حسب المجموعة)</h3>
          {charges.length === 0 ? (
            <p className="text-sm text-muted">لا توجد مستحقات مسجلة بعد</p>
          ) : (
            <div className="divide-y divide-border">
              {charges.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{c.reason}</p>
                    {c.group && <p className="text-xs text-muted">{c.group.name}</p>}
                  </div>
                  <span className="font-semibold text-danger">{c.amount.toString()} ج.م</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-0">
          <h3 className="p-4 pb-0 font-bold">المدفوعات</h3>
          {payments.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">لا توجد مدفوعات مسجلة</p>
          ) : (
            <div className="divide-y divide-border">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold text-success">{p.amount.toString()} ج.م</span>
                  <span className="text-muted">{p.method}</span>
                  <span className="text-muted">{new Date(p.createdAt).toLocaleDateString("ar-EG")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StudentPaymentForm studentId={studentId} />
    </div>
  );
}

async function NotificationsTab({ userId }: { userId: string }) {
  const notifications = await db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 });

  return (
    <div className="card p-0">
      {notifications.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted">لا توجد إشعارات</p>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((n) => (
            <div key={n.id} className="px-4 py-3">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-sm text-muted">{n.body}</p>
              <p className="mt-1 text-xs text-muted">{new Date(n.createdAt).toLocaleString("ar-EG")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NfcTab({ student }: { student: StudentProfile }) {
  return (
    <div className="card max-w-sm text-center">
      <Nfc className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-2 font-bold">كارت NFC</p>
      {student.nfcCards.length === 0 ? (
        <>
          <p className="mt-1 text-sm text-muted">لم يتم ربط كارت بعد</p>
          <Link href="/nfc" className="btn-primary mt-3 inline-flex">برمجة كارت</Link>
        </>
      ) : (
        <div className="mt-3 space-y-1 text-sm">
          <p dir="ltr" className="font-mono">{student.nfcCards[0].cardUid}</p>
          <p className="text-muted">الحالة: {student.nfcCards[0].status === "ACTIVE" ? "مفعّل" : "غير مفعّل"}</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted" />
      <span className="text-muted">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
