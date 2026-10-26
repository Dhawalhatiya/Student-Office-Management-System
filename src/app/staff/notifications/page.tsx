import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Notifications" };

export default async function StaffNotifications() {
  const { user } = await requireStaff();
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <>
      <PageHeader title="Notifications" />
      {items.length === 0 ? <EmptyState title="You have no notifications" /> : (
        <ul className="panel divide-y divide-line">
          {items.map((n) => (
            <li key={n.id} className="px-4 py-3">
              <div className="flex flex-wrap justify-between gap-2"><span className={`text-sm ${n.readAt ? "" : "font-semibold"}`}>{n.title}</span><span className="text-xs text-muted">{formatDateTime(n.createdAt)}</span></div>
              <p className="mt-1 text-sm text-muted">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
