import { requireStaff } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Results" };

export default async function Page() {
  await requireStaff("results.read");
  return <PlannedPage title="Results" phase="Phase 4" summary="Result lifecycle management." items={["Draft, under review, approved, published", "Audited corrections to published results", ]} />;
}
