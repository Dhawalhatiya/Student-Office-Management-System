import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Access denied" };

export default async function AccessDenied() {
  await requireStaff();
  return (
    <>
      <PageHeader title="You do not have access to this area" />
      <div className="panel p-6">
        <p>Your staff group is not permitted to open this section. This attempt has been recorded.</p>
        <p className="mt-2 text-sm text-muted">If you need access, ask the Student Office to review your staff group.</p>
        <Link href="/staff" className="btn btn-primary mt-5">Back to dashboard</Link>
      </div>
    </>
  );
}
