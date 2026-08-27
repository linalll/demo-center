import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/permissions/require";
import { EditPermissionsForm } from "@/components/users/edit-permissions-form";

export default async function EditUserPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("users.manage");

  const { id } = await params;
  const targetUser = await db.user.findUniqueOrThrow({
    where: { id },
    include: { permissionOverrides: { include: { permission: true }, where: { granted: true } } },
  });

  const initialSelected = targetUser.permissionOverrides.map((o) => o.permission.key);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">صلاحيات {targetUser.fullName}</h1>
        <p className="mt-1 text-muted">حدد بالضبط ما يستطيع هذا الموظف الوصول إليه</p>
      </div>
      <EditPermissionsForm userId={targetUser.id} initialSelected={initialSelected} />
    </div>
  );
}
