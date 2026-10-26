import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { STUDENT_NAV } from "@/lib/nav";
import { logoutAction } from "../actions";
import AppShell from "@/components/AppShell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireStudent();
  const unread = await db.notification.count({ where: { userId: user.id, readAt: null } });
  return (
    <AppShell portalLabel="Student Portal" homeHref="/student" nav={STUDENT_NAV} unread={unread}
      user={{ name: user.name, subtitle: "Student" }} logoutAction={logoutAction}>
      <div id="main">{children}</div>
    </AppShell>
  );
}
