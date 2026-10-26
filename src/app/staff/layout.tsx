import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { STAFF_NAV } from "@/lib/nav";
import { can, STAFF_ROLE_LABELS } from "@/lib/permissions";
import { logoutAction } from "../actions";
import AppShell from "@/components/AppShell";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, staffRole } = await requireStaff();
  const unread = await db.notification.count({ where: { userId: user.id, readAt: null } });
  // Navigation only lists areas this staff group may open. The pages enforce it again on the server.
  const nav = STAFF_NAV.filter((i) => !i.permission || can(staffRole, i.permission)).map(({ href, label, icon }) => ({ href, label, icon }));
  return (
    <AppShell portalLabel="Administrative Staff Portal" homeHref="/staff" nav={nav} unread={unread}
      user={{ name: user.name, subtitle: STAFF_ROLE_LABELS[staffRole] }}
      searchAction={can(staffRole, "students.read") ? "/staff/students" : undefined}
      searchPlaceholder="Search by enrollment number or name" logoutAction={logoutAction}>
      <div id="main">{children}</div>
    </AppShell>
  );
}
