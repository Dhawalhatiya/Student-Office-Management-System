import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, titleCase } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Notifications" };

export default async function StudentNotifications() {
  const { user } = await requireStudent();
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <>
      <PageHeader title="Notifications" description="Updates about your requests, fees, results and documents." />
      {items.length === 0 ? (
        <EmptyState title="You have no notifications">Updates will appear here as soon as something changes.</EmptyState>
      ) : (
        <ul className="panel divide-y divide-line">
          {items.map((n) => (
            <li key={n.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm ${n.readAt ? "" : "font-semibold"}`}>{n.title}</span>
                {!n.readAt && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-white">New</span>}
                <span className="ml-auto text-xs text-muted">{titleCase(n.type)} · {formatDateTime(n.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted">Marking notifications as read arrives in a later phase.</p>
    </>
  );
}
