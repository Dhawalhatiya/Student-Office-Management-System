import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { getStaffDashboard } from "@/lib/metrics";
import { permissionsFor, can } from "@/lib/permissions";
import { formatDate, formatDateTime, titleCase } from "@/lib/format";
import { EmptyState, Metric, PageHeader, StatusBadge } from "@/components/ui";

export const metadata = { title: "Dashboard" };

const QUICK = [
  { href: "/staff/students", label: "Search student", perm: "students.read" },
  { href: "/staff/records", label: "Create or update student record", perm: "students.write" },
  { href: "/staff/requests", label: "Review request", perm: "requests.read" },
  { href: "/staff/fees", label: "Generate receipt", perm: "fees.write" },
  { href: "/staff/results", label: "Update result", perm: "results.write" },
  { href: "/staff/documents", label: "Review documents", perm: "documents.review" },
  { href: "/staff/reports", label: "Export data", perm: "reports.export" },
  { href: "/staff/assistant", label: "Open AI Data Assistant", perm: "ai.assistant" },
] as const;

export default async function StaffDashboard() {
  const { user, staffRole } = await requireStaff();
  const d = await getStaffDashboard(permissionsFor(staffRole));
  const feeCount = (s: string) => d.fees?.find((f) => f.status === s)?._count._all ?? 0;
  const quick = QUICK.filter((q) => can(staffRole, q.perm));

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Figures below come from the database and only include areas your staff group can access." />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key figures">
        {d.totalStudents !== null && <Metric label="Total students" value={d.totalStudents} />}
        {d.fees && (<>
          <Metric label="Paid fee accounts" value={feeCount("PAID")} tone="good" hint="Current academic year" />
          <Metric label="Unpaid fee accounts" value={feeCount("UNPAID")} tone="warn" hint="Current academic year" />
          <Metric label="Partially paid accounts" value={feeCount("PARTIAL")} hint="Current academic year" />
        </>)}
        {d.requests && <Metric label="Pending requests" value={d.requests.pending} hint="Submitted or under review" />}
        {d.docsAwaiting !== null && <Metric label="Documents awaiting review" value={d.docsAwaiting} />}
        {d.scholarshipDocsAwaiting !== null && <Metric label="Scholarship documents awaiting review" value={d.scholarshipDocsAwaiting} />}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {d.requests && (
          <section className="panel p-5" aria-labelledby="by-status">
            <h2 id="by-status" className="text-lg font-semibold">Requests by status</h2>
            <ul className="mt-3 space-y-2">
              {d.requests.byStatus.length === 0 && <li><EmptyState title="No requests yet" /></li>}
              {d.requests.byStatus.map((r) => (
                <li key={r.status} className="flex items-center justify-between text-sm"><StatusBadge value={r.status} /><span className="font-semibold">{r._count._all}</span></li>
              ))}
            </ul>
            <h3 className="mt-5 text-base font-semibold">Open requests by priority</h3>
            <ul className="mt-2 space-y-2">
              {d.requests.byPriority.map((r) => (
                <li key={r.priority} className="flex items-center justify-between text-sm"><StatusBadge value={r.priority} /><span className="font-semibold">{r._count._all}</span></li>
              ))}
            </ul>
          </section>
        )}

        <section className="panel p-5" aria-labelledby="qa">
          <h2 id="qa" className="text-lg font-semibold">Quick actions</h2>
          {quick.length === 0 ? <div className="mt-3"><EmptyState title="No actions available for your staff group" /></div> : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {quick.map((q) => (
                <li key={q.href}><Link href={q.href} className="block rounded-lg border border-line px-3 py-2.5 text-sm font-medium hover:bg-brand-50">{q.label}</Link></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {d.requests && (
        <section className="panel mt-6 overflow-x-auto p-5" aria-labelledby="recent">
          <h2 id="recent" className="text-lg font-semibold">Recent requests</h2>
          <table className="table mt-3">
            <thead><tr><th>Request</th><th>Student</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned to</th><th>Submitted</th></tr></thead>
            <tbody>
              {d.requests.recent.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.ticketNo}<div className="font-normal text-muted">{r.subject}</div></td>
                  <td>{r.student.fullName}<div className="text-xs text-muted">{r.student.enrollmentNo}</div></td>
                  <td>{titleCase(r.category)}</td>
                  <td><StatusBadge value={r.priority} /></td>
                  <td><StatusBadge value={r.status} /></td>
                  <td>{r.assignedTo?.name ?? <span className="text-muted">Unassigned</span>}</td>
                  <td>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {d.recentActivity && (
        <section className="panel mt-6 p-5" aria-labelledby="activity">
          <h2 id="activity" className="text-lg font-semibold">Recent administrative activity</h2>
          {d.recentActivity.length === 0 ? <div className="mt-3"><EmptyState title="No activity recorded yet" /></div> : (
            <ul className="mt-3 divide-y divide-line">
              {d.recentActivity.map((a) => (
                <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                  <span>{a.summary}<span className="text-muted"> · {a.actor?.name ?? "System"}</span></span>
                  <span className="text-xs text-muted">{formatDateTime(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
