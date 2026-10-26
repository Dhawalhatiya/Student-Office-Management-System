import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageHeader, StatusBadge } from "@/components/ui";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const { user, studentId } = await requireStudent();
  // Scoped by the session's own student id: there is no way to request another student's profile.
  const s = await db.student.findUniqueOrThrow({
    where: { id: studentId },
    include: { programme: true, department: true, academicYear: true },
  });
  const rows: [string, React.ReactNode][] = [
    ["Enrollment number", s.enrollmentNo],
    ["Full name", s.fullName],
    ["Date of birth", formatDate(s.dateOfBirth)],
    ["Email", user.email],
    ["Phone number", s.phone],
    ["Department", s.department.name],
    ["Programme", s.programme.name],
    ["Batch (admission year)", s.admissionYear],
    ["Current semester", s.currentSemester],
    ["Academic year", s.academicYear.label],
    ["Enrollment status", <StatusBadge key="st" value={s.enrollmentStatus} />],
    ["Address", s.address ?? "-"],
  ];
  return (
    <>
      <PageHeader title="My Profile" description="These details are maintained by the Student Office. All data is fictional." />
      <section className="panel p-2 sm:p-4">
        <dl className="grid sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="border-b border-line px-3 py-3 last:border-0">
              <dt className="text-sm text-muted">{k}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900">
        Need to correct something? Protected details such as your name and date of birth can only be changed by the Student Office. The correction request form arrives in Phase 5.
      </p>
    </>
  );
}
