import { requireStaff } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Documents" };

export default async function Page() {
  await requireStaff("documents.review");
  return <PlannedPage title="Documents" phase="Phase 4" summary="Private document review." items={["Verify, reject or request replacement with notes", ]} />;
}
