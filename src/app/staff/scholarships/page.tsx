import { requireStaff } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Scholarships" };

export default async function Page() {
  await requireStaff("scholarships.read");
  return <PlannedPage title="Scholarships" phase="Phase 4" summary="Scholarship programmes and configurable requirements." items={["Create programmes and required documents", "Review student submissions", ]} />;
}
