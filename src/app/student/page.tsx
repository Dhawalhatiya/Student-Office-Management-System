import Link from "next/link";
import { Bell, FileUp, GraduationCap, ListChecks, Receipt, Award, Send } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { getStudentDashboard } from "@/lib/metrics";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { EmptyState, Metric, PageHeader, StatusBadge } from "@/components/ui";

export const metadata = { title: "Dashboard" };

const ACTIONS = [
  { href: "/student/requests/new", label: "Submit a request", icon: Send },
  { href: "/student/fees", label: "View fee status", icon: Receipt },
  { href: "/student/results", label: "View results", icon: GraduationCap },
  { href: "/student/requests", label: "Track requests", icon: ListChecks },
  { href: "/student/documents", label: "Upload a document", icon: FileUp },
  { href: "/student/scholarships", label: "View scholarship checklist", icon: Award },
];

export default async function StudentDashboard() {
  const { user, studentId } = await requireStudent();
  const d = await getStudentDashboard(studentId, user.id);
  const s = d.student;

  return (
    <>
      <PageHeader title={`Welcome, ${s.fullName.split(" ")[0]}`} description="Here is where things stand with your records. All data is fictional demo data." />

      <section className="panel mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Student summary">
        <Info label="Enrollment number" value={s.enrollmentNo} />
        <Info label="Programme" value={s.programme.name} />
        <Info label="Department" value={s.department.name} />
        <Info label="Semester" value={`Semester ${s.currentSemester} · ${s.academicYear.label}`} />
        <div>
          <div className="text-sm text-muted">Enrollment status</div>
          <div className="mt-1"><StatusBadge value={s.enrollmentStatus} /></div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key figures">
        <Metric label="Fee balance" value={d.fee ? formatINR(d.fee.balance) : "No fee record"}
          hint={d.fee ? <>Due {formatDate(d.fee.dueDate)}</> : undefined} tone={d.fee && d.fee.balance > 0 ? "warn" : "good"} />
        <div className="panel p-4">
          <div className="text-sm text-muted">Payment status</div>
          <div className="mt-2">{d.fee ? <StatusBadge value={d.fee.status} /> : "-"}</div>
          {d.fee && <div className="mt-2 text-xs text-muted">{formatINR(d.fee.paid)} of {formatINR(d.fee.total)} paid</div>}
        </div>
        <Metric label="Latest published result" value={d.latestResult ? `SGPA ${d.latestResult.sgpa?.toFixed(2)}` : "None yet"}
          hint={d.latestResult ? <>Semester {d.latestResult.semester.number} · CGPA {d.latestResult.cgpa?.toFixed(2)}</> : undefined} />
        <Metric label="Open requests" value={d.openRequests} hint={d.docsNeedingAttention > 0 ? undefined : "No documents need attention"} />
      </section>

      {d.docsNeedingAttention > 0 && (
        <p role="status" className="mb-6 rounded-lg border border-gold/40 bg-gold-50 px-4 py-3 text-sm">
          {d.docsNeedingAttention} document{d.docsNeedingAttention === 1 ? " needs" : "s need"} your attention.{" "}
          <Link href="/student/documents" className="font-semibold underline">Open My Documents</Link>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="panel p-5" aria-labelledby="qa">
          <h2 id="qa" className="text-lg font-semibold">Quick actions</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ACTIONS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm font-medium hover:bg-brand-50">
                  <Icon size={16} className="text-brand-600" aria-hidden /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-5" aria-labelledby="notif">
          <div className="flex items-center justify-between">
            <h2 id="notif" className="text-lg font-semibold">Recent notifications</h2>
            <Link href="/student/notifications" className="text-sm font-medium text-brand-700 underline">View all</Link>
          </div>
          {d.notifications.length === 0 ? (
            <div className="mt-3"><EmptyState title="No notifications yet">Updates about requests, fees and documents will appear here.</EmptyState></div>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {d.notifications.map((n) => (
                <li key={n.id} className="flex gap-3 py-3">
                  <Bell size={16} className={`mt-1 shrink-0 ${n.readAt ? "text-muted" : "text-gold"}`} aria-hidden />
                  <div>
                    <p className={`text-sm ${n.readAt ? "" : "font-semibold"}`}>{n.title}</p>
                    <p className="text-sm text-muted">{n.body}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
