import { requireStaff } from "@/lib/auth";
import { permissionsFor, STAFF_ROLE_LABELS } from "@/lib/permissions";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Settings" };

export default async function StaffSettings() {
  const { user, staffRole } = await requireStaff();
  const perms = permissionsFor(staffRole);
  return (
    <>
      <PageHeader title="Settings" description="Your account and what your staff group is allowed to do. There is no Super Admin role in this system." />
      <section className="panel p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-muted">Name</dt><dd className="font-medium">{user.name}</dd></div>
          <div><dt className="text-sm text-muted">Email</dt><dd className="font-medium">{user.email}</dd></div>
          <div><dt className="text-sm text-muted">Designation</dt><dd className="font-medium">{user.designation}</dd></div>
          <div><dt className="text-sm text-muted">Staff group</dt><dd className="font-medium">{STAFF_ROLE_LABELS[staffRole]}</dd></div>
        </dl>
      </section>
      <section className="panel mt-6 p-5">
        <h2 className="text-lg font-semibold">Your permissions</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {perms.map((p) => <li key={p} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800">{p}</li>)}
        </ul>
      </section>
    </>
  );
}
