# سنتر أنمكا — ANMKA Center

نظام إدارة سنتر تعليمي متكامل (Next.js + PostgreSQL) مبني حسب [system.md](./system.md).

## التشغيل محليًا

1. **قاعدة بيانات PostgreSQL** — لا يوجد Postgres محلي على هذا الجهاز. وفّر واحدة عبر إحدى الطرق:
   - Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`
   - تثبيت محلي (`brew install postgresql@16`)
   - خدمة مُدارة: Supabase / Neon / Railway

2. انسخ `.env.example` إلى `.env` وحدّث `DATABASE_URL` (و`JWT_SECRET` لاحقًا في الإنتاج).

3. ثبّت الحزم وجهّز قاعدة البيانات:

   ```bash
   npm install
   npm run db:push      # ينشئ الجداول من prisma/schema.prisma
   npm run db:seed       # بيانات تجريبية: سنتر، أدوار، مستخدمين، مجموعة، طلاب، جلسات
   ```

4. شغّل السيرفر:

   ```bash
   npm run dev
   ```

5. سجّل الدخول برقم `+201000000001` (Admin) وكلمة السر `password123` (كل حسابات الـ Seed تستخدم نفس كلمة السر).

## الأوامر

| أمر | الوصف |
|---|---|
| `npm run dev` | تشغيل السيرفر محليًا |
| `npm run build` | بناء الإنتاج (يشغّل type-check تلقائيًا) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest — اختبارات منطق الأعمال |
| `npm run db:push` | مزامنة السكيمة مع القاعدة بدون migration files |
| `npm run db:migrate` | إنشاء migration رسمية |
| `npm run db:seed` | تعبئة بيانات تجريبية |
| `npm run db:studio` | واجهة Prisma Studio لتصفح البيانات |

## البنية المعمارية

- **Frontend + Backend**: Next.js 16 (App Router) — Route Handlers في `app/api/**` تعمل كـ Node.js backend، بدون سيرفر منفصل، تماشيًا مع "لا تستخدم Architecture معقدة بدون داعي".
- **Database**: PostgreSQL عبر Prisma (`prisma/schema.prisma`) — سكيمة كاملة لكل الكيانات في قسم 39 من system.md.
- **Auth**: تسجيل دخول برقم الهاتف + كلمة سر (`lib/auth/`, `auth.service.ts`)، جلسات JWT قابلة للإبطال (`AuthSession` في القاعدة)، دون اعتماد على Email. الـ OTP (`lib/auth/otp.ts`) مستخدم فقط في تدفّق "نسيت كلمة السر".
- **Permissions**: نظام صلاحيات حقيقي أبعد من الأدوار — `Role` + `Permission` + `RolePermission` + `UserPermission` (تخصيص فردي لكل Assistant)، مُطبّق على الـ Backend حصرًا (`lib/permissions/`, `lib/api/handler.ts`).
- **Business logic layer** منفصل تمامًا عن الـ UI، في `lib/services/`:
  - `attendance.service.ts` — محرك الحضور (توليد الحصص من الجدول، QR/NFC check-in، حساب التأخير/الغياب التلقائي بعد Grace Period)
  - `finance.service.ts` — نظام مالي بحساب المديونية كـ Ledger (Charges − Payments)، يدعم Monthly/Per-Session/Custom
  - `notification.service.ts` + `whatsapp/` — مركز إشعارات + طبقة WhatsApp منفصلة (Adapter Pattern) قابلة لاستبدال المزوّد بدون لمس منطق الأعمال
  - `exam.service.ts` — امتحانات أونلاين (تصحيح تلقائي للاختيارات) وأوفلاين (رصد يدوي)
- **i18n**: قواميس ترجمة (`lib/i18n/`) بدل نصوص Hardcoded، عربي افتراضيًا RTL، بنية جاهزة لإضافة لغات.
- **RTL + Cairo Font**: مضبوطة من `app/layout.tsx` (اتجاه الصفحة يتحدد من اللغة الحالية).

## القاعدة الأهم في النظام (قسم 3)

الطالب لا يُعتبر غائبًا لمجرد تسجيله في السنتر. الغياب يُحسب فقط بعد: إنشاء **Group** → ربطه بـ **Schedule** (أيام ومواعيد) → تسجيل الطالب في المجموعة. عندها فقط يُنشئ النظام `ExpectedAttendance` لكل حصة قادمة (`generateSessionsForGroup` + `ensureExpectedAttendanceForStudent`)، وبعدها فقط يتحول الطالب تلقائيًا لـ Absent إذا لم يسجل حضوره بعد انتهاء الـ Grace Period (`closeSessionAndMarkAbsences`).

## حالة التنفيذ مقابل المراحل الـ 27 (قسم 61)

منجز بالكامل (Backend + Database + Frontend + Permissions متكاملة، ومبني ومُختبر بنجاح — `npm run build` و`npm run lint` و`npm run test` كلها تمر بدون أخطاء):

- **Phase 1–5**: Architecture, Database Schema, Authentication (هاتف + كلمة سر، مع استعادة كلمة السر عبر OTP), Roles & Permissions, Center Setup
- **Phase 6–11**: Students (بما فيها المراحل الدراسية والصفوف `/subjects/stages`)، Parents، Teachers، Subjects، Groups، Schedules & Sessions
- **Phase 12**: Attendance Engine (توليد الحصص، Expected Attendance، Grace Period، تأخير/غياب تلقائي)
- **Phase 13–14**: QR Attendance، بنية NFC كاملة (شاشة `/nfc` لبرمجة الكارت + Check-in) — منفصلة عن Hardware فعليًا
- **Phase 15**: Attendance Preparation Screen (شاشة تحضير الحصة بالكامل: QR + يدوي)
- **Phase 16–17**: Notification Center + WhatsApp API (Adapter منفصل، قوالب قابلة للتعديل من `/settings`)
- **Phase 18–19**: Exams — إنشاء امتحان بأسئلة متعددة الأنواع، **شاشة أداء الامتحان أونلاين للطالب بتايمر وتصحيح تلقائي**، ونتائج أوفلاين
- **Phase 20**: Finance — Ledger-based debt calculation، 3 Billing Models، شاشات المدفوعات/المصروفات/المديونيات، إيصال قابل للطباعة
- **Phase 21**: Reports — تقارير حضور/مالية/امتحانات/مدرسين مع فلاتر وتصدير CSV
- **Phase 22**: Dashboards منفصلة لكل دور — Admin (إحصائيات كاملة)، Teacher (حصص اليوم)، Parent (Student Switcher)، Student (جدول ونتائج)، Assistant (روابط حسب صلاحياته فقط)
- **Phase 23**: Settings — بيانات السنتر، إعدادات الحضور والمالية، تفعيل واتساب، محرر قوالب الرسائل
- **Phase 25**: Testing (Vitest لمنطق الحضور، الصلاحيات، والحسابات المالية)

إضافات ما بعد الأساسي:
- بطاقة طالب قابلة للطباعة (QR مُولّد فعليًا) على `/students/[id]/id-card`
- سجل العمليات (Audit Log) على `/audit-log`
- **تدقيق صلاحيات كامل على مستوى الصفحات**: كل صفحة محمية تتحقق من الصلاحية فعليًا في الـ Backend (`requirePagePermission`) — إخفاء الرابط من الـ Sidebar وحده لم يكن كافيًا (قسم 43)، وتمت إضافة `canAccessStudent` لمنع أي مستخدم من فتح ملف طالب آخر بمجرد معرفة الـ ID

متبقٍّ / معروف كفجوة (بصراحة، لتجنّب الادّعاء الزائد):

- **Phase 24 (Mobile)**: البنية Mobile-first (Bottom Nav، Cards، لمسات كبيرة) موجودة، لكن لم يتم اختبارها فعليًا على شاشات هاتف حقيقية — فقط build/lint تم التحقق منهما
- **Phase 26–27 (Production hardening)**: لا يوجد Rate Limiting على مسارات تسجيل الدخول/استعادة كلمة السر بعد، ولا Caching على الاستعلامات المتكررة (Dashboard)، ولا `loading.tsx` لكل مسار (فقط Skeleton داخل بعض الـ Client Components)
- **i18n على مستوى الـ Components**: البنية (`lib/i18n/`) جاهزة بالكامل (قواميس عربي/إنجليزي، RTL/LTR تلقائي)، لكن نصوص الواجهة داخل الصفحات والمكوّنات لا تزال Hardcoded بالعربي مباشرة وليست عبر `t()` — هذه أكبر فجوة حقيقية متبقية عن قسم 42 ("لا تكتب النصوص داخل Components بشكل Hardcoded")، وربطها الكامل عمل كبير (~50+ ملف) لم يتم لضيق الوقت
- Course model (فوق Subject) موجود في السكيمة لكن بلا واجهة إدارة منفصلة (Subjects تُدار مباشرة بدون تجميعها في كورسات)

## ملاحظات أمنية مهمة قبل الإنتاج (قسم 43)

- `JWT_SECRET` الحالي قيمة تطوير فقط — **يجب** توليد سر عشوائي طويل حقيقي في `.env` الإنتاج.
- الاتصال بـ WhatsApp Business API معطّل افتراضيًا (`whatsappEnabled: false`) — فعّله من إعدادات المركز بعد توفير `WHATSAPP_ACCESS_TOKEN` الحقيقي.
- لم تُضَف طبقة Rate Limiting بعد على `/api/auth/login` و`/api/auth/forgot-password` — ضرورية قبل الإطلاق العام لمنع محاولات تخمين كلمة السر.
