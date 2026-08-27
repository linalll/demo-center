# مشروع: سنتر أنمكا – ANMKA Center Management System

أريد منك إنشاء نظام إدارة سنتر تعليمي كامل باسم:

**سنتر أنمكا – ANMKA Center**

النظام يجب أن يكون Production-Ready وقابل للتوسع، وليس مجرد Demo أو صفحات Static.

## 1. Technology Stack

استخدم التقنيات التالية:

* Frontend: **Next.js** بأحدث Stable Version
* Backend: **Node.js**
* Database: **SQL Database** ويفضل PostgreSQL
* API: REST API منظمة وقابلة للتوسع
* Authentication: نظام تسجيل دخول آمن باستخدام رقم الهاتف
* UI: Modern Responsive Web App
* اللغة الأساسية: العربية
* Font: **Cairo**
* الاتجاه الأساسي: RTL
* يجب دعم جميع اللغات مستقبلًا من خلال i18n Architecture
* WhatsApp Integration: WhatsApp Business API
* QR Code Attendance
* NFC Attendance
* NFC Card Programming / Registration
* Notifications System
* Role-Based Access Control
* Responsive Mobile-First Design

لا تستخدم Architecture معقدة بدون داعي.

أهم شيء:

**النظام يكون سريع، خفيف، واضح، وسهل الاستخدام حتى للشخص غير التقني.**

---

# 2. الهوية والتصميم

اسم النظام في كل مكان:

**سنتر أنمكا**

ويظهر الاسم بالإنجليزية عند الحاجة:

**ANMKA Center**

استخدم هوية بصرية مناسبة لنظام تعليمي احترافي، ويكون اللون الأساسي قريب من درجات الأزرق، مع ألوان ثانوية متناسقة.

الخط العربي الأساسي:

**Cairo**

التصميم يجب أن يكون:

* Modern
* Elegant
* Clean
* Premium
* Minimal
* Fast
* Mobile First
* App-like UI

لا أريد شكل موقع Admin تقليدي قديم.

أريد أن يشعر المستخدم أن النظام عبارة عن **تطبيق إدارة سنتر** وليس Website.

استخدم Animations خفيفة واحترافية، مثل:

* Page transitions
* Cards animations
* Modal animations
* Hover effects
* Loading states
* Skeleton loading
* Smooth dropdowns
* Toast notifications
* Animated statistics

لكن لا تكثر من الـ animations لدرجة تؤثر على السرعة.

---

# 3. أهم قاعدة في المشروع

قبل بناء أي صفحة، قم بتصميم وفهم الـ Business Logic بالكامل.

خصوصًا Logic الخاص بالحضور والغياب.

النظام لا يجب أن يعتبر الطالب غائبًا لمجرد أنه مسجل في السنتر.

يجب أن يبدأ النظام في حساب حضور وغياب الطالب **فقط بعد أن يقوم السنتر بإنشاء الحصص والمجموعات والجداول وربط الطلاب بالمجموعات**.

مثال:

السنتر أنشأ:

المادة: Math

المجموعة: Math Grade 3 - Group A

المدرس: Ahmed

الأيام:

Saturday - Monday - Wednesday

الساعة:

5:00 PM

وتم تسجيل الطالب:

Mohamed Ali

داخل هذه المجموعة.

هنا النظام يعرف تلقائيًا أن:

Mohamed Ali

مفروض يحضر يوم السبت والاثنين والأربعاء الساعة 5.

إذا لم يتم تسجيل حضوره في الحصة:

يتم اعتباره غائبًا تلقائيًا.

إذا سجل حضوره بعد وقت معين:

يتم تسجيله متأخرًا.

ويجب أن يتم إرسال Notification لولي الأمر حسب إعدادات السنتر.

---

# 4. Landing Page

أنشئ Homepage احترافية للنظام باسم:

**سنتر أنمكا**

توضح للزائر مميزات النظام مثل:

* إدارة الطلاب
* إدارة المدرسين
* إدارة المجموعات
* الحضور بالـ QR
* الحضور بالـ NFC
* متابعة الغياب والتأخير
* إشعارات أولياء الأمور
* الامتحانات
* النتائج
* المصروفات
* المديونيات
* التقارير
* إدارة الموظفين
* إدارة الصلاحيات

يجب أن تحتوي الصفحة على:

* Hero Section
* Features
* How It Works
* Attendance Section
* Exams Section
* Parent Notifications Section
* Finance Section
* Dashboard Preview
* CTA
* Footer

التصميم يكون Modern ومناسب لمنتج SaaS تعليمي.

---

# 5. Authentication

كل المستخدمين يقومون بإنشاء الحساب وتسجيل الدخول باستخدام:

**رقم الهاتف**

بدون الاعتماد على Email كطريقة أساسية.

أنشئ:

* Login
* Register
* Logout
* Forgot / Reset Access
* OTP Architecture
* Session Management
* Secure Authentication

جهز النظام بحيث يمكن ربط OTP بمزود SMS مستقبلًا.

---

# 6. User Roles

النظام يجب أن يحتوي على Role-Based Access Control.

الـ Roles الأساسية:

### Admin

يمتلك كل الصلاحيات.

### Center Assistant

موظف السنتر.

يمكن التحكم بالتحديد في الصلاحيات الخاصة به.

### Teacher

يمكنه الوصول فقط إلى البيانات المتعلقة به مثل:

* مجموعاته
* طلابه
* حصصه
* الحضور
* الامتحانات
* النتائج

### Student

يمكنه رؤية:

* بياناته
* مجموعاته
* جدوله
* الحضور
* الغياب
* التأخير
* الامتحانات
* النتائج
* المصروفات والمديونيات الخاصة به

### Parent

يمكنه رؤية بيانات الأبناء المرتبطين بحسابه:

* الحضور
* الغياب
* التأخير
* الجدول
* الامتحانات
* النتائج
* المصروفات
* المديونيات
* الإشعارات

يجب أن يستطيع Admin إنشاء Roles إضافية مستقبلًا.

---

# 7. Permission System

لا تعتمد فقط على Role.

أنشئ Permission System حقيقي.

مثال:

students.view
students.create
students.edit
students.delete

teachers.view
teachers.create
teachers.edit
teachers.delete

attendance.view
attendance.create
attendance.edit

exams.view
exams.create
exams.edit
exams.delete

finance.view
finance.create
finance.edit

reports.view

users.manage

settings.manage

وغيرها.

الـ Admin يستطيع تحديد صلاحيات كل Assistant.

---

# 8. Dashboard

Dashboard مختلفة حسب المستخدم.

## Admin Dashboard

تعرض بشكل واضح:

* إجمالي الطلاب
* الطلاب الحاضرين اليوم
* الطلاب الغائبين
* الطلاب المتأخرين
* عدد المدرسين
* عدد المجموعات
* عدد الحصص اليوم
* الإيرادات
* المدفوعات
* إجمالي المديونيات
* الأرباح
* الامتحانات القادمة
* Notifications

مع Charts وإحصائيات.

---

# 9. Student Management

صفحة إدارة الطلاب.

Admin / Assistant يستطيع:

* إضافة طالب
* تعديل طالب
* حذف / تعطيل طالب
* البحث
* Filter
* Sort
* Pagination

بيانات الطالب:

* الاسم الكامل
* الصورة
* رقم الهاتف
* تاريخ الميلاد
* الجنس
* المرحلة الدراسية
* المدرسة
* الصف
* العنوان
* ولي الأمر
* رقم ولي الأمر
* المجموعات
* المواد
* الكارت الخاص به
* QR Code
* الحالة
* تاريخ التسجيل

---

# 10. Parent Management

إدارة أولياء الأمور.

بيانات ولي الأمر:

* الاسم
* رقم الهاتف
* صورة
* الأبناء
* Notifications
* الحساب
* حالة الحساب

يمكن لولي الأمر ربط أكثر من طالب بحسابه.

مثال:

Parent Account

يحتوي على:

* Ahmed
* Mohamed
* Sara

ويستطيع التبديل بينهم بسهولة من داخل التطبيق.

---

# 11. Teacher Management

إدارة المدرسين:

* الاسم
* الصورة
* رقم الهاتف
* المواد
* المجموعات
* الحصص
* الجدول
* الحالة
* بيانات إضافية

---

# 12. Groups Management

إدارة المجموعات.

كل Group تحتوي على:

* اسم المجموعة
* المادة
* المدرس
* الصف
* الطلاب
* الأيام
* مواعيد الحصص
* مكان الحصة / القاعة
* سعر الاشتراك
* الحد الأقصى للطلاب
* الحالة

---

# 13. Subjects & Courses

إدارة:

* المواد
* الكورسات
* المراحل الدراسية
* الصفوف

يمكن ربط المادة بـ:

* Teacher
* Group
* Schedule
* Exams
* Students

---

# 14. Schedule System

نظام جدول كامل.

Admin يستطيع إنشاء:

* الحصص
* الأيام
* أوقات البداية والنهاية
* المدرس
* المجموعة
* المادة
* القاعة

Calendar View.

ويجب أن يستطيع المستخدم رؤية الجدول حسب صلاحياته.

---

# 15. Attendance System

هذه من أهم أجزاء المشروع.

النظام يجب أن يدعم:

## QR Attendance

كل طالب لديه QR Code خاص به.

عند Scan:

يتم التعرف على الطالب.

النظام يتحقق:

* هل الطالب مسجل في المجموعة؟
* هل لديه حصة الآن؟
* هل هذه الحصة تخصه؟
* هل تم تسجيل حضوره بالفعل؟

إذا كل شيء صحيح:

يتم تسجيل:

Attendance = Present

مع:

* Date
* Time
* Student
* Group
* Session
* Attendance Method

Attendance Method:

QR

---

# 16. NFC Attendance

كل طالب يحصل على NFC Card مخصصة له.

الكارت يكون مربوطًا بحساب الطالب.

عند تمرير الكارت على NFC Reader:

النظام يتعرف على الطالب تلقائيًا.

ثم يقوم بنفس Validation الخاصة بالـ QR.

Attendance Method:

NFC

يجب تخزين:

* Card UID
* Student ID
* Assigned Date
* Status
* Last Used
* Device

---

# 17. NFC Card Programming

أنشئ صفحة:

**برمجة كروت NFC**

من خلالها Admin / Assistant يستطيع:

1. اختيار الطالب
2. الضغط على "برمجة كارت"
3. وضع الكارت على جهاز NFC Reader
4. قراءة Card UID
5. ربط الكارت بالطالب
6. حفظ البيانات
7. إظهار رسالة نجاح

يجب أن تكون الـ NFC architecture قابلة للتكامل مع NFC Reader Hardware مستقبلًا.

افصل Hardware Integration عن Business Logic.

---

# 18. Attendance Automatic Logic

عند إنشاء Schedule:

مثال:

Group A

Saturday

5:00 PM

إذا كان:

Student X

مشترك في Group A

فإن النظام يقوم تلقائيًا بإنشاء Expected Attendance للطالب في كل Session.

عند موعد الحصة:

يتم انتظار تسجيل الحضور.

إذا لم يتم تسجيل الحضور حتى انتهاء الـ grace period:

يتم تحويل الحالة إلى:

Absent

إذا حضر قبل وقت الحصة أو داخل الوقت:

Present

إذا حضر بعد وقت معين:

Late

يجب أن يكون:

Grace Period

قابل للتعديل من Settings.

مثال:

Late After: 10 Minutes

---

# 19. Attendance Preparation Screen

أنشئ صفحة مخصصة للتحضير للحصة.

يتم استخدامها من:

* Assistant Mobile
* Admin Mobile

تظهر فيها:

* اسم الحصة
* اسم المادة
* اسم المجموعة
* صورة المدرس
* اسم المدرس
* موعد الحصة
* عدد الطلاب
* عدد الحاضرين
* عدد الغائبين
* عدد المتأخرين

وقائمة الطلاب.

لكل طالب:

* الصورة
* الاسم
* حالة الحضور

مع إمكانية تسجيل:

Present
Absent
Late

يدويًا.

---

# 20. Attendance Notifications

عند تسجيل حضور الطالب:

يتم إرسال Notification لولي الأمر.

مثال:

"تم تسجيل حضور محمد أحمد في حصة الرياضيات اليوم الساعة 5:03 مساءً."

عند الغياب:

"لم يتم تسجيل حضور محمد أحمد في حصة الرياضيات اليوم."

عند التأخير:

"تم تسجيل حضور محمد أحمد متأخرًا في حصة الرياضيات اليوم."

كل الرسائل يجب أن تكون قابلة للتعديل من Admin.

---

# 21. WhatsApp Integration

أنشئ WhatsApp Notification Service.

استخدم:

**WhatsApp Business API**

واجعل Integration Layer منفصلة عن النظام الأساسي.

الـ Service يجب أن يكون قادرًا على إرسال:

* Attendance Notification
* Absence Notification
* Late Notification
* Exam Reminder
* Exam Result
* Payment Confirmation
* Debt Reminder
* General Notification

اجعل الرسائل Templates قابلة للتعديل.

مثال Variables:

{{student_name}}

{{parent_name}}

{{subject_name}}

{{group_name}}

{{date}}

{{time}}

{{amount}}

{{remaining_amount}}

---

# 22. Notification Center

أنشئ Notification System داخل التطبيق.

Admin يستطيع إرسال Notification إلى:

* جميع الطلاب
* جميع أولياء الأمور
* مجموعة محددة
* طالب محدد
* ولي أمر محدد
* مدرسين
* موظفين

ويظهر:

* In-app notification
* WhatsApp notification

مع سجل كامل للرسائل.

---

# 23. Exams System

نظام امتحانات متكامل.

Admin / Teacher يستطيع إنشاء امتحان.

الامتحان يحتوي على:

* اسم الامتحان
* المادة
* المجموعة
* التاريخ
* الوقت
* الدرجة النهائية
* مدة الامتحان
* الأسئلة
* نوع السؤال

أنواع الأسئلة:

* Multiple Choice
* True / False
* Short Answer
* Essay

---

# 24. Online Exams

الطالب يدخل الامتحان من حسابه.

يظهر:

* Timer
* Questions
* Answers
* Progress
* Submit

يجب حفظ الإجابات أثناء الامتحان.

بعد انتهاء الامتحان:

يتم التصحيح تلقائيًا للأسئلة التي يمكن تصحيحها تلقائيًا.

---

# 25. Offline Exams

يجب أن يدعم النظام إدخال امتحانات تمت خارج النظام.

مثال:

المدرس عمل امتحان ورقي.

Admin / Teacher يقوم بإضافة:

Student → Exam → Score

مثال:

Math Exam

Total: 100

Mohamed = 87

يتم حفظ النتيجة تلقائيًا داخل ملف الطالب.

ويتم إرسال النتيجة لولي الأمر عبر WhatsApp.

مثال:

"تم تسجيل نتيجة محمد أحمد في امتحان الرياضيات: 87 من 100."

---

# 26. Results

صفحة نتائج للطالب وولي الأمر.

تظهر:

* اسم الامتحان
* المادة
* التاريخ
* الدرجة
* الدرجة النهائية
* النسبة
* التقدير

مع Statistics للطالب.

مثال:

Average Score

Highest Score

Lowest Score

Average by Subject

---

# 27. Exam Notifications

إرسال Notification قبل الامتحان.

مثال:

"تذكير: امتحان الرياضيات لمجموعة Grade 3 - Group A غدًا الساعة 5 مساءً."

وعند إدخال النتيجة:

"تم إعلان نتيجة امتحان الرياضيات."

---

# 28. Finance System

نظام مالي كامل للسنتر.

إدارة:

* الاشتراكات
* المدفوعات
* المصروفات
* الإيرادات
* المديونيات
* الخصومات
* المتبقي

لكل طالب:

* Subscription
* Total Amount
* Paid
* Remaining
* Payment History

---

# 29. Attendance-Based Finance

أريد النظام قابلًا لحساب المبالغ بناءً على حضور الطالب إذا كان نظام السنتر يعتمد على الحضور.

يجب أن يدعم النظام أكثر من Billing Model:

### Monthly Subscription

الطالب يدفع اشتراك شهري.

### Per Session

الطالب يدفع بناءً على عدد الحصص التي حضرها.

### Custom

نظام مخصص يحدده Admin.

مثال:

Session Price = 100 EGP

Student attended 8 sessions

Total = 800 EGP

إذا دفع 500:

Remaining = 300 EGP

---

# 30. Admin Financial Dashboard

أنشئ Dashboard مالية بسيطة وواضحة.

تظهر:

* إجمالي الأموال المحصلة
* إجمالي المصروفات
* صافي الربح
* إجمالي المديونيات
* المدفوعات اليوم
* المدفوعات هذا الشهر
* عدد الطلاب المديونين

مع إمكانية Filter:

Today
This Week
This Month
Custom Date

---

# 31. Student Financial Profile

داخل صفحة الطالب:

Financial Summary

* Total Due
* Paid
* Remaining
* Last Payment
* Payment History

مع زر:

"تسجيل دفعة"

ويمكن طباعة إيصال.

---

# 32. Reports

أنشئ Reports System متكامل.

التقارير تشمل:

### Attendance Reports

* حضور الطلاب
* الغياب
* التأخير
* نسبة الحضور
* أكثر الطلاب غيابًا

### Financial Reports

* الإيرادات
* المصروفات
* الأرباح
* المديونيات
* المدفوعات

### Exam Reports

* نتائج الطلاب
* متوسط النتائج
* أعلى الدرجات
* أقل الدرجات
* نتائج كل مجموعة
* نتائج كل مادة

### Teacher Reports

* عدد الحصص
* عدد الطلاب
* مجموعاته

يجب أن تدعم التقارير:

* Filters
* Search
* Date Range
* Export

---

# 33. Student Profile

أنشئ صفحة Profile قوية للطالب.

تحتوي على Tabs:

Overview
Attendance
Schedule
Groups
Exams
Results
Payments
Notifications
NFC Card

---

# 34. Parent App / Portal

ولي الأمر لديه Dashboard بسيطة جدًا.

أهم شيء فيها:

* أبنائي
* حضور اليوم
* الغياب
* التأخير
* جدول الحصص
* الامتحانات القادمة
* النتائج
* المديونية
* المدفوعات
* Notifications

لو لديه أكثر من طفل:

يوجد Student Switcher واضح وسهل.

---

# 35. Teacher Dashboard

Teacher Dashboard:

* حصصي اليوم
* مجموعاتي
* الطلاب
* التحضير
* الامتحانات
* النتائج
* الجدول

ولا يرى أي بيانات مالية أو بيانات لا تخصه إلا إذا تم إعطاؤه Permission.

---

# 36. Assistant Dashboard

Assistant Dashboard حسب الـ Permissions الخاصة به.

مثلاً إذا لديه صلاحية Attendance فقط:

يرى:

* Attendance
* Students
* Sessions

ولا يرى Finance.

---

# 37. Mobile Experience

هذه نقطة مهمة جدًا.

النظام بالكامل يجب أن يكون Responsive.

لكن لا أريد مجرد Desktop Website تم تصغيره على Mobile.

أريد Mobile-first UI.

على الموبايل:

* Bottom Navigation عند الحاجة
* Large Touch Targets
* Cards
* Swipe interactions عند الحاجة
* Mobile-friendly tables
* Mobile-friendly forms
* Mobile-friendly attendance scanner
* Mobile-friendly preparation screen

ويجب أن يشعر المستخدم أنه يستخدم **App**.

---

# 38. Performance

الأداء مهم جدًا.

يجب مراعاة:

* Server-side rendering عند الحاجة
* Lazy Loading
* Code Splitting
* Image Optimization
* Pagination
* Database Indexing
* Efficient Queries
* Caching
* API Optimization
* Debounced Search
* Optimistic UI عند الحاجة

لا تقم بتحميل بيانات ضخمة بدون Pagination.

---

# 39. Database Design

صمم Database Architecture احترافية.

يجب أن تكون العلاقات واضحة بين:

Users
Roles
Permissions
Students
Parents
Teachers
Assistants
Subjects
Courses
Groups
Classrooms
Schedules
Sessions
Attendance
AttendanceLogs
NFC Cards
QR Codes
Exams
Questions
Answers
ExamAttempts
ExamResults
Subscriptions
Payments
Expenses
Debts
Notifications
WhatsApp Messages
Settings

استخدم Foreign Keys وIndexes المناسبة.

---

# 40. Audit Logs

أنشئ Audit Log.

يسجل العمليات المهمة:

* من أضاف طالب
* من عدل بيانات
* من حذف
* من سجل حضور يدوي
* من عدل نتيجة
* من سجل دفعة
* من غير Permission

مع:

User
Action
Entity
Entity ID
Timestamp
IP / Device عند الحاجة

---

# 41. Settings

صفحة Settings كبيرة ومنظمة.

تشمل:

### Center Settings

* اسم السنتر
* Logo
* Phone
* Address
* Working Hours

### Attendance Settings

* Grace Period
* Late Rules
* Automatic Absence
* Attendance Notification

### Finance Settings

* Billing Model
* Currency
* Payment Rules

### WhatsApp Settings

* API Credentials
* Templates
* Enable / Disable Notifications

### Notification Settings

### Language Settings

### User & Permission Settings

---

# 42. Multi-language Architecture

اللغة الافتراضية:

Arabic

لكن النظام يجب أن يكون مبنيًا بطريقة تسمح بإضافة:

English

وأي لغة أخرى مستقبلًا.

لا تكتب النصوص داخل Components بشكل Hardcoded.

استخدم Translation Keys.

---

# 43. Security

طبق Security Best Practices.

يشمل:

* Password / OTP Security
* Secure Sessions
* Role-Based Authorization
* Permission Checks على Backend وليس Frontend فقط
* Input Validation
* SQL Injection Protection
* XSS Protection
* CSRF Protection حسب Architecture
* Rate Limiting
* Secure API
* Secure Secrets Management

لا تعتمد على إخفاء الـ UI فقط لمنع الوصول.

---

# 44. UX Rules

أريد النظام بسيط جدًا.

مثلاً إضافة طالب يجب أن تكون واضحة:

"إضافة طالب"

ثم خطوات بسيطة.

لا تجعل المستخدم يتعامل مع 20 Field في صفحة واحدة بدون تنظيم.

استخدم:

* Wizards
* Steps
* Tabs
* Smart Defaults
* Searchable Dropdowns
* Auto Complete
* Confirmation Dialogs

---

# 45. Empty States

كل صفحة ليس بها بيانات يجب أن تحتوي على Empty State مفيدة.

مثلاً:

"لا توجد مجموعات حتى الآن"

ثم Button:

"إنشاء مجموعة"

---

# 46. Loading / Error States

كل API Request يجب أن يحتوي على:

* Loading State
* Skeleton
* Error State
* Retry
* Success Toast

لا تظهر صفحات بيضاء أثناء تحميل البيانات.

---

# 47. Notification UX

استخدم Toast Notifications مثل:

"تم إضافة الطالب بنجاح"

"تم تسجيل الحضور"

"تم تسجيل الدفعة"

"تم ربط الكارت بالطالب"

---

# 48. Search

البحث يجب أن يكون سريعًا.

Admin يستطيع البحث عن طالب باستخدام:

* الاسم
* رقم الهاتف
* Student ID
* Card UID

ويجب أن يكون هناك Global Search عند الحاجة.

---

# 49. QR System

كل طالب يجب أن يحصل على QR Code خاص به.

يمكن:

* عرض QR
* طباعته
* تحميله
* إعادة توليده إذا لزم الأمر

ويجب أن يكون لكل طالب Unique Identifier.

---

# 50. Student ID Card

أنشئ Student Card احترافية.

تحتوي على:

* Logo
* Student Photo
* Student Name
* Student ID
* QR Code
* NFC Card Status

ويجب أن تكون قابلة للطباعة.

---

# 51. Dashboard Navigation

اجعل Sidebar / Navigation منظمة جدًا.

مثلاً:

Dashboard

الطلاب

* كل الطلاب
* إضافة طالب

الحضور والانصراف

* تحضير حصة
* سجل الحضور
* الغياب
* التأخير
* QR Attendance
* NFC Cards

المجموعات

* المجموعات
* الحصص
* الجدول

المدرسين

المواد والكورسات

الامتحانات

* الامتحانات
* إنشاء امتحان
* النتائج

المالية

* المدفوعات
* المصروفات
* المديونيات
* التقارير

الإشعارات

المستخدمين والصلاحيات

الإعدادات

---

# 52. Important Business Flow

أريدك أن تبني النظام حول هذا الـ Flow:

## Step 1

Admin ينشئ:

Subject

مثلاً:

Math

## Step 2

Admin ينشئ:

Teacher

Ahmed

## Step 3

Admin ينشئ:

Group

Grade 3 - Group A

ويربط:

Math + Ahmed

## Step 4

Admin يحدد:

Schedule

Saturday
Monday
Wednesday

5:00 PM

## Step 5

Admin يضيف الطلاب إلى Group.

## Step 6

كل طالب يحصل على:

Student ID
QR Code
NFC Card

## Step 7

النظام يعرف تلقائيًا Sessions المطلوبة للطلاب.

## Step 8

عند موعد الحصة:

Assistant يفتح:

"تحضير الحصة"

ويظهر:

Math
Grade 3 - Group A
Ahmed

مع صورة المدرس.

## Step 9

الطلاب يسجلون:

QR

أو:

NFC

## Step 10

النظام يسجل:

Present

أو:

Late

## Step 11

بعد انتهاء الـ Grace Period / Session:

الطلاب الذين لم يسجلوا حضورهم يتم تحويلهم تلقائيًا إلى:

Absent

## Step 12

يتم إرسال WhatsApp Notification لولي الأمر.

## Step 13

يتم تحديث Attendance Statistics.

## Step 14

إذا كان Billing Model يعتمد على الحضور:

يتم تحديث المبلغ المستحق على الطالب تلقائيًا.

---

# 53. Development Method

لا أريد منك بناء المشروع كله في ملف واحد أو Components ضخمة.

استخدم:

* Clean Architecture
* Modular Components
* Reusable Components
* Reusable API Services
* Database Services
* Validation Layer
* Permission Middleware
* Notification Service
* WhatsApp Service
* Attendance Service
* Finance Service
* Exam Service

---

# 54. Code Quality

الكود يجب أن يكون:

* Clean
* Readable
* Maintainable
* Scalable
* Well Structured

لا تكرر الكود.

استخدم reusable components.

لا تستخدم fake data في النسخة النهائية إلا في Seed Data للاختبار.

---

# 55. Seed Data

قم بإنشاء Seed Data لتجربة النظام.

مثلاً:

Center:

سنتر أنمكا

Admin

Assistant

Teacher

Parent

Students

Subjects

Groups

Schedules

Sessions

Attendance

Exams

Payments

Notifications

---

# 56. API Documentation

أنشئ API Documentation واضحة.

كل Endpoint يجب أن يكون موضحًا:

* Method
* Endpoint
* Authentication
* Permissions
* Request
* Response
* Errors

---

# 57. Environment Variables

كل Secrets يجب أن تكون في:

.env

مثل:

DATABASE_URL
JWT_SECRET
WHATSAPP_API_URL
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID

ولا تضع أي Secrets داخل Git.

أنشئ:

.env.example

---

# 58. Project Structure

اختر Project Structure احترافية وقابلة للتوسع.

افصل:

Frontend

Backend

Database

Services

Components

Features

Auth

Attendance

Finance

Exams

Notifications

WhatsApp

Users

Reports

---

# 59. Testing

أضف Tests للـ Business Logic المهمة، خصوصًا:

Attendance

Late Calculation

Automatic Absence

Finance Calculation

Debt Calculation

Exam Results

Permissions

Authentication

NFC Card Assignment

---

# 60. أهم قواعد التنفيذ

لا تقم بعمل مجرد UI Prototype.

أريد:

**Full Functional System**

يعمل فعليًا مع Database وAPIs وAuthentication وBusiness Logic.

لا تستخدم:

fake buttons

fake forms

fake login

fake attendance

fake finance

إذا كانت Feature غير مكتملة، أكمل Backend + Database + Frontend.

---

# 61. ابدأ المشروع بهذا الترتيب

لا تبدأ عشوائيًا.

ابدأ بالترتيب:

### Phase 1

Architecture

### Phase 2

Database Schema

### Phase 3

Authentication

### Phase 4

Roles & Permissions

### Phase 5

Center Setup

### Phase 6

Students

### Phase 7

Parents

### Phase 8

Teachers

### Phase 9

Subjects

### Phase 10

Groups

### Phase 11

Schedules & Sessions

### Phase 12

Attendance Engine

### Phase 13

QR Attendance

### Phase 14

NFC Architecture

### Phase 15

Attendance Preparation

### Phase 16

Notifications

### Phase 17

WhatsApp API

### Phase 18

Exams

### Phase 19

Offline Exam Results

### Phase 20

Finance

### Phase 21

Reports

### Phase 22

Dashboards

### Phase 23

Settings

### Phase 24

Mobile Optimization

### Phase 25

Testing

### Phase 26

Performance Optimization

### Phase 27

Production Preparation

---

# 62. VERY IMPORTANT – Before Coding

قبل كتابة الكود:

1. قم بتحليل المشروع بالكامل.
2. صمم Database Schema.
3. حدد جميع Entities والعلاقات.
4. حدد User Roles.
5. حدد Permissions.
6. حدد API Architecture.
7. حدد Attendance Business Logic.
8. حدد Finance Business Logic.
9. حدد Notification Architecture.
10. حدد WhatsApp Integration Architecture.
11. حدد Project Structure.

ثم ابدأ التنفيذ.

لا تسألني عن كل Feature بشكل منفصل إذا كانت المتطلبات واضحة في هذا المستند.

إذا وجدت قرارًا تقنيًا غير محدد، اختر الحل الأكثر احترافية وقابلية للتوسع بدلًا من إيقاف التنفيذ.

---

# 63. Final Goal

المنتج النهائي يجب أن يكون:

**سنتر أنمكا – ANMKA Center**

نظام SaaS كامل لإدارة السناتر التعليمية.

يجب أن يكون:

* سريع
* خفيف
* Modern
* Responsive
* Mobile First
* Arabic RTL
* Cairo Font
* Easy to Use
* Secure
* Scalable
* Production Ready

وأهم تجربة في النظام هي:

**إضافة الطالب → إضافته للمجموعة → إنشاء الجدول → إنشاء الحصص تلقائيًا → تسجيل الحضور QR/NFC → حساب التأخير والغياب تلقائيًا → إرسال WhatsApp لولي الأمر → تحديث التقارير والمالية والمديونيات تلقائيًا.**

أريد أن يكون هذا الـ Flow هو قلب النظام بالكامل.

ابدأ أولًا بإنشاء:

**Project Architecture + Database Schema + Core Business Logic + Development Roadmap**

ثم ابدأ تنفيذ المشروع فعليًا Module by Module، وبعد كل Module تأكد أن الـ Frontend والBackend والDatabase والPermissions متكاملة قبل الانتقال إلى الـ Module التالية.
