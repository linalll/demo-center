import Link from "next/link";
import {
  GraduationCap,
  QrCode,
  Nfc,
  BellRing,
  ClipboardCheck,
  Award,
  Wallet,
  BarChart3,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Logo } from "@/components/brand/logo";
import { db } from "@/lib/db";

const WHY_US = [
  { icon: ClipboardCheck, title: "متابعة حضور لحظية", desc: "تعرف فورًا لو ابنك حضر، اتأخر، أو غاب — بدون ما تتصل أو تسأل." },
  { icon: BellRing, title: "إشعارات واتساب فورية", desc: "رسالة على واتساب لحظة تسجيل الحضور، الغياب، أو ظهور نتيجة امتحان." },
  { icon: Award, title: "امتحانات ونتائج واضحة", desc: "امتحانات دورية إلكترونية وورقية، ونتائج مفصلة لكل مادة." },
  { icon: Wallet, title: "نظام دفع شفاف", desc: "تعرف بالظبط المستحق عليك وتاريخ كل دفعة، بدون أي التباس." },
  { icon: GraduationCap, title: "مدرسين متخصصين", desc: "فريق تدريس مؤهل، متابعة مستمرة لمستوى كل طالب." },
  { icon: BarChart3, title: "تقارير دورية", desc: "تقدم ابنك واضح قدامك بالأرقام، مش بس بالكلام." },
];

const JOURNEY = [
  { title: "التسجيل", desc: "تسجّل بيانات ابنك ويحصل على كارت وكود خاص به." },
  { title: "الانضمام لمجموعة", desc: "بيتسجل في المجموعة المناسبة لسنّه ومستواه." },
  { title: "الحضور والمتابعة", desc: "حضور دقيق لكل حصة، وتقييم مستمر من المدرس." },
  { title: "الامتحانات والنتائج", desc: "امتحانات دورية، ونتائج توصلكم أول بأول." },
  { title: "تواصل مستمر", desc: "بنبقى على تواصل معاكم بكل جديد عن ابنكم." },
];

export default async function LandingPage() {
  const center = await db.center.findFirst();
  const [studentsCount, teachersCount, groupsCount] = await Promise.all([
    db.student.count({ where: { status: "ACTIVE" } }),
    db.teacher.count({ where: { status: "ACTIVE" } }),
    db.group.count({ where: { status: "ACTIVE" } }),
  ]);

  const centerName = center?.name ?? "سنتر أنمكا";
  const centerNameEn = center?.nameEn ?? "ANMKA Center";

  return (
    <div className="flex min-h-full flex-col">
      <Navbar name={centerName} nameEn={centerNameEn} />
      <Hero name={centerName} students={studentsCount} teachers={teachersCount} groups={groupsCount} />
      <TrustStrip />
      <WhyUs name={centerName} />
      <Journey />
      <AttendanceSection />
      <ExamsSection />
      <ParentSection />
      <FinanceSection />
      <ContactSection center={center} name={centerName} />
      <CTA name={centerName} />
      <Footer name={centerName} nameEn={centerNameEn} />
    </div>
  );
}

function Navbar({ name, nameEn }: { name: string; nameEn: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Logo size={36} />
          <div>
            <p className="font-bold leading-none">{name}</p>
            <p className="text-xs text-muted leading-none mt-0.5">{nameEn}</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          <a href="#why-us" className="hover:text-foreground">ليه إحنا</a>
          <a href="#journey" className="hover:text-foreground">رحلة الطالب</a>
          <a href="#attendance" className="hover:text-foreground">الحضور</a>
          <a href="#contact" className="hover:text-foreground">تواصل معنا</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-foreground hover:text-primary">
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/30 transition-all hover:bg-primary-dark hover:shadow-md active:scale-95"
          >
            طالب جديد؟ سجّل الآن
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero({ name, students, teachers, groups }: { name: string; students: number; teachers: number; groups: number }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/60 to-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="animate-enter">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary-light">
            <Sparkles className="h-4 w-4" /> سنتر تعليمي متخصص
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            {name} <br />
            لتعليم <span className="text-primary">متميز</span> ومتابعة دقيقة
          </h1>
          <p className="mt-5 text-lg text-muted">
            بنساعد أبناءكم يتفوقوا دراسيًا من خلال متابعة يومية للحضور والدرجات، وتواصل مستمر معاكم
            عبر واتساب أول بأول — علشان تطمنوا على مستوى ابنكم في أي وقت.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark hover:shadow-xl active:scale-95"
            >
              تسجيل الدخول لمتابعة ابنك <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/register" className="font-semibold text-foreground hover:text-primary">
              مش مسجّل؟ أنشئ حساب
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> متابعة لحظية</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> إشعارات واتساب</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> نظام دفع شفاف</span>
          </div>
        </div>

        <div className="relative rounded-3xl border border-border bg-surface p-6 shadow-2xl shadow-primary/10 animate-enter" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between border-b border-border pb-4">
            <p className="font-bold">أرقامنا</p>
            <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">مباشر</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatMini label="طالب" value={String(students)} tone="primary" />
            <StatMini label="مدرس" value={String(teachers)} tone="success" />
            <StatMini label="مجموعة" value={String(groups)} tone="warning" />
          </div>
          <div className="mt-5 space-y-2 rounded-2xl bg-background p-4">
            <p className="text-xs font-semibold text-muted">آخر تحديث</p>
            <p className="font-semibold">تم تسجيل حضور محمد أحمد في حصة الرياضيات</p>
            <p className="text-xs text-success">تم إرسال إشعار واتساب لولي الأمر ✓</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatMini({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "primary" }) {
  const toneClass = { success: "text-success", warning: "text-warning", primary: "text-primary" }[tone];
  return (
    <div className="rounded-2xl bg-background p-4 text-center">
      <p className={`text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function TrustStrip() {
  return (
    <div className="border-y border-border bg-surface py-6">
      <p className="text-center text-sm text-muted">
        متابعة يومية · تواصل مستمر · نتائج واضحة — علشان راحة بالكم وتفوق أبناءكم
      </p>
    </div>
  );
}

function WhyUs({ name }: { name: string }) {
  return (
    <section id="why-us" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading eyebrow="ليه إحنا" title={`ليه أولياء الأمور يثقوا في ${name}`} />
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {WHY_US.map((f, i) => (
          <div
            key={f.title}
            style={{ animationDelay: `${i * 60}ms` }}
            className="stagger-item card card-interactive"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-light text-primary transition-all group-hover:bg-primary group-hover:text-white">
              <f.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-bold">{f.title}</p>
            <p className="mt-1 text-sm text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Journey() {
  return (
    <section id="journey" className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="رحلة الطالب" title="من التسجيل لحد التفوق — خطوة بخطوة" />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {JOURNEY.map((step, i) => (
            <div key={step.title} style={{ animationDelay: `${i * 70}ms` }} className="stagger-item relative rounded-2xl border border-border p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-3 font-bold">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AttendanceSection() {
  return (
    <section id="attendance" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <SectionHeading eyebrow="الحضور" title="بنتابع حضور ابنك بدقة" subtitle="" />
          <ul className="mt-6 space-y-4">
            {[
              "كل طالب له كود QR وكارت NFC خاص بيه لتسجيل حضور فوري",
              "تسجيل الحضور بيتم في ثوانٍ لحظة دخول الطالب الحصة",
              "لو اتأخر أو غاب، بتوصلكم رسالة واتساب فورًا",
              "مفيش تدخل يدوي — كل حاجة بتتحسب أوتوماتيك",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <span className="text-muted">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="card card-interactive text-center">
            <QrCode className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 font-bold">حضور بالـ QR</p>
            <p className="mt-1 text-sm text-muted">مسح سريع عند دخول الحصة</p>
          </div>
          <div className="card card-interactive text-center">
            <Nfc className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 font-bold">حضور بالـ NFC</p>
            <p className="mt-1 text-sm text-muted">تمرير الكارت وتسجيل فوري</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExamsSection() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="الامتحانات" title="امتحانات دورية ونتائج واضحة" />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { title: "أنواع أسئلة متنوعة", desc: "اختيار من متعدد، صح وخطأ، إجابة قصيرة، ومقالي." },
            { title: "نتائج فورية", desc: "تصحيح تلقائي للامتحانات الإلكترونية." },
            { title: "امتحانات ورقية", desc: "نتيجة كل امتحان ورقي بتتسجل في ملف ابنكم مباشرة." },
          ].map((c, i) => (
            <div key={c.title} style={{ animationDelay: `${i * 60}ms` }} className="stagger-item card">
              <Award className="h-8 w-8 text-primary" />
              <p className="mt-3 font-bold">{c.title}</p>
              <p className="mt-1 text-sm text-muted">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ParentSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="card order-2 md:order-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-muted"><MessageCircle className="h-4 w-4" /> إشعار واتساب</p>
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl bg-primary-light p-4 text-sm text-primary-dark">
              تم تسجيل حضور محمد أحمد في حصة الرياضيات اليوم الساعة 5:03 مساءً.
            </div>
            <div className="rounded-2xl bg-background p-4 text-sm text-muted">
              تذكير: امتحان الرياضيات غدًا الساعة 5 مساءً.
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <SectionHeading eyebrow="أولياء الأمور" title="إشعارات فورية عبر واتساب" subtitle="" />
          <ul className="mt-6 space-y-4">
            {["إشعار عند الحضور والغياب والتأخير", "تذكير قبل الامتحانات وإعلان النتائج", "تأكيد الدفعات وتذكير بالمستحقات"].map(
              (t) => (
                <li key={t} className="flex items-start gap-3">
                  <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-muted">{t}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FinanceSection() {
  return (
    <section id="finance" className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="الاشتراكات" title="أنظمة اشتراك مرنة تناسبكم" />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { title: "اشتراك شهري", desc: "مبلغ ثابت شهري، مناسب للمتابعة المستمرة." },
            { title: "بالحصة", desc: "بتدفعوا بس على عدد الحصص اللي حضرها ابنكم فعليًا." },
            { title: "خطة مخصصة", desc: "حسب ظروف كل أسرة، تواصلوا معانا لترتيب الأنسب." },
          ].map((c, i) => (
            <div key={c.title} style={{ animationDelay: `${i * 60}ms` }} className="stagger-item card">
              <Wallet className="h-8 w-8 text-primary" />
              <p className="mt-3 font-bold">{c.title}</p>
              <p className="mt-1 text-sm text-muted">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ center, name }: { center: { phone: string | null; address: string | null; workingHours: string | null } | null; name: string }) {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading eyebrow="تواصل معنا" title={`زوروا ${name} أو تواصلوا معانا`} />
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card text-center">
          <Phone className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-bold">اتصل بينا</p>
          <p className="mt-1 text-sm text-muted" dir="ltr">{center?.phone ?? "سيتم الإعلان قريبًا"}</p>
        </div>
        <div className="card text-center">
          <MapPin className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-bold">موقعنا</p>
          <p className="mt-1 text-sm text-muted">{center?.address ?? "سيتم الإعلان قريبًا"}</p>
        </div>
        <div className="card text-center">
          <Clock className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-bold">مواعيد العمل</p>
          <p className="mt-1 text-sm text-muted">{center?.workingHours ?? "سيتم الإعلان قريبًا"}</p>
        </div>
      </div>
    </section>
  );
}

function CTA({ name }: { name: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-8 py-14 text-center text-white shadow-xl shadow-primary/30">
        <h2 className="text-3xl font-extrabold sm:text-4xl">انضموا لعائلة {name}</h2>
        <p className="mt-3 text-primary-light">سجّلوا الآن وابدأوا رحلة متابعة دقيقة لتفوق أبنائكم الدراسي.</p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary shadow-lg transition-all hover:bg-primary-light active:scale-95"
        >
          سجّل الآن <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer({ name, nameEn }: { name: string; nameEn: string }) {
  return (
    <footer className="border-t border-border bg-surface py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} {name} — {nameEn}. جميع الحقوق محفوظة.</p>
        <div className="flex items-center gap-6">
          <a href="#why-us" className="hover:text-foreground">ليه إحنا</a>
          <a href="#contact" className="hover:text-foreground">تواصل معنا</a>
          <Link href="/login" className="hover:text-foreground">تسجيل الدخول</Link>
        </div>
      </div>
    </footer>
  );
}
