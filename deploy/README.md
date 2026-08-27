# نشر سنتر أنمكا على السيرفر

## الإعداد لمرة واحدة (تم بالفعل)

- خادم: `77.237.232.181:2222` (HestiaCP)، مستخدم SSH مخصص للنشر بمفتاح `~/.ssh/anmka_deploy`
  (متاح كـ alias باسم `anmka-server` في `~/.ssh/config` — بدون كلمة سر)
- الموقع: `/home/adminanmkavps/web/centar.anmka.com/public_html`
- قاعدة البيانات: PostgreSQL محلية على السيرفر، قاعدة `centar_anmka` بمستخدم مخصص
- التطبيق يعمل عبر PM2 باسم `centar-anmka-com` على منفذ داخلي (راجع `.env` على السيرفر لرقم المنفذ)
- Nginx: HestiaCP بتدير الـ vhost تلقائيًا، وملف الـ reverse proxy المخصص في
  `/home/adminanmkavps/conf/web/centar.anmka.com/nginx.conf_routing`
- SSL: شهادة Let's Encrypt عبر أداة Hestia (`v-add-letsencrypt-domain`)

## نشر تعديل جديد

بعد أي تعديل محلي، شغّل من جذر المشروع:

```bash
./deploy/deploy.sh
```

هيعمل: مزامنة الملفات (rsync) → `npm install` → `prisma generate` → `prisma db push`
(بيطبّق أي تعديل جديد في `schema.prisma`) → `next build` → إعادة تشغيل PM2.

**ملاحظة مهمة**: السكريبت **لا يلمس ملف `.env` على السيرفر أبدًا** — الأسرار (JWT_SECRET،
DATABASE_URL، بيانات واتساب) موجودة هناك فقط ومحدّثة يدويًا لو احتجت تغيّرها:

```bash
ssh anmka-server
nano /home/adminanmkavps/web/centar.anmka.com/public_html/.env
pm2 restart centar-anmka-com
```

## أوامر مفيدة على السيرفر

```bash
ssh anmka-server
pm2 logs centar-anmka-com        # اللوجز المباشرة
pm2 restart centar-anmka-com     # إعادة تشغيل
pm2 status                       # حالة كل التطبيقات على السيرفر (احترس، فيه عشرات التطبيقات التانية)
```

⚠️ السيرفر ده مشترك ومُستضاف عليه عشرات المواقع التانية عبر PM2 و Nginx. لا تستخدم
`pm2 delete all` أو أي أمر جماعي — استهدف `centar-anmka-com` بالاسم فقط دايمًا.

## ملاحظة عن إعداد Nginx (HestiaCP)

الدومين ده مُدار عبر HestiaCP، والـ vhost بتاعه بيتولّد تلقائيًا في:
`/etc/nginx/conf.d/domains/centar.anmka.com.ssl.conf` (وملف `.conf` المكافئ لـ HTTP).
القالب الافتراضي فيه location متداخلة جوه `location /` بتحاول تسيب nginx يسيرف ملفات
الصور/CSS/JS كملفات ثابتة مباشرة (بافتراض إنها PHP app) — وده كان بيتعارض مع الـ proxy
بتاعنا لـ Next.js ويسبب 404 لكل حاجة في `public/` (لوجو، أيقونات، إلخ). **تم حذف
الـ location المتداخلة دي يدويًا** من ملف الـ `.ssl.conf` (مش من ملف الـ template
الأصلي، ده تعديل مباشر على الملف المتولّد).

⚠️ **لو حد استخدم لوحة Hestia لتعديل إعدادات الدومين ده (مش عن طريق الـ SSH)، ممكن
يعيد توليد الملف ده ويرجّع الـ location المتداخلة، وترجع مشكلة الـ 404 للملفات
الثابتة.** لو حصل كده، افتح `/etc/nginx/conf.d/domains/centar.anmka.com.ssl.conf`
واحذف الجزء ده:
```
location ~* ^.+\.(jpeg|jpg|png|webp|gif|bmp|ico|svg|css|js)$ {
    expires max;
    fastcgi_hide_header "Set-Cookie";
}
```
ثم `nginx -t && systemctl reload nginx`.
