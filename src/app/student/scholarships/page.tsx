import { requireStudent } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Scholarships" };

export default async function Page() {
  await requireStudent();
  return <PlannedPage title="Scholarships" phase="Phase 4" summary="Scholarship programmes with a configurable document checklist." items={["Eligibility notes", "Required-document checklist with status", ]} />;
}
