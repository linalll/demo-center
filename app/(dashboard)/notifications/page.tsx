import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions/check";
import { BroadcastForm } from "@/components/notifications/broadcast-form";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const canBroadcast = hasPermission(user, "notifications.create");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">الإشعارات</h1>
        <p className="mt-1 text-muted">سجل الإشعارات الخاصة بك</p>
      </div>

      <div className={`grid gap-6 ${canBroadcast ? "lg:grid-cols-3" : ""}`}>
        <div className={`card p-0 ${canBroadcast ? "lg:col-span-2" : ""}`}>
          {notifications.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">لا توجد إشعارات بعد</p>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div key={n.id} className="flex gap-3 px-4 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-light text-primary">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-sm text-muted">{n.body}</p>
                    <p className="mt-1 text-xs text-muted">{new Date(n.createdAt).toLocaleString("ar-EG")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {canBroadcast && <BroadcastForm />}
      </div>
    </div>
  );
}
