import { requireStaff } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Reports and Exports" };

export default async function Page() {
  await requireStaff("reports.export");
  return <PlannedPage title="Reports and Exports" phase="Phase 6" summary="Filter builder with preview, Excel and PDF export and export logging." items={["Server-validated filters", "Excel and PDF exports", ]} />;
}
