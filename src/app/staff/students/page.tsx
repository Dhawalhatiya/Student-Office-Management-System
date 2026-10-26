import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { db, insensitive } from "@/lib/db";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export const metadata = { title: "Student Search" };

const querySchema = z.object({ q: z.string().trim().max(64).optional() });

export default async function StudentSearch({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaff("students.read");
  const parsed = querySchema.safeParse(await searchParams);
  const q = parsed.success ? parsed.data.q ?? "" : "";

  // Prisma builds parameterised queries; q is never concatenated into SQL.
  const students = await db.student.findMany({
    where: q
      ? { OR: [{ enrollmentNo: q.toUpperCase() }, { enrollmentNo: { contains: q.toUpperCase() } }, { fullName: { contains: q, ...insensitive } }] }
      : undefined,
    include: { programme: true, department: true, feeRecords: { where: { academicYear: { isCurrent: true } }, select: { status: true } } },
    orderBy: [{ enrollmentNo: "asc" }],
    take: 50,
  });

  return (
    <>
      <PageHeader title="Student Search" description="Search by exact enrollment number first. Name search is also supported. Filters for department, programme, batch, semester, fee and scholarship status arrive in Phase 3." />
      <form method="get" role="search" className="mb-5 flex max-w-xl gap-2">
        <label htmlFor="q" className="sr-only">Enrollment number or name</label>
        <input id="q" name="q" defaultValue={q} maxLength={64} placeholder="e.g. AVU-DEMO-24-CSE-001" className="input" />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>
      {!parsed.success && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900">The search text is too long. Use at most 64 characters.</p>}
      {students.length === 0 ? (
        <EmptyState title="No students match your search">Check the enrollment number or try part of the name.</EmptyState>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="table">
            <thead><tr><th>Enrollment no.</th><th>Name</th><th>Programme</th><th>Batch</th><th>Semester</th><th>Enrollment</th><th>Fee status</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.enrollmentNo}</td>
                  <td>{s.fullName}</td>
                  <td>{s.programme.name}</td>
                  <td>{s.admissionYear}</td>
                  <td>{s.currentSemester}</td>
                  <td><StatusBadge value={s.enrollmentStatus} /></td>
                  <td>{s.feeRecords[0] ? <StatusBadge value={s.feeRecords[0].status} /> : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">Showing up to 50 matches. Student detail pages with tabs arrive in Phase 3.</p>
    </>
  );
}
