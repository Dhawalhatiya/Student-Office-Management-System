import { requireStaff } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Student Records" };

export default async function Page() {
  await requireStaff("students.read");
  return <PlannedPage title="Student Records" phase="Phase 3" summary="Student detail with tabs and audited profile updates." items={["Profile, enrollment, fees, results, documents, scholarships, requests and audit tabs", "Updates for permitted fields with a reason and an audit entry", ]} />;
}
