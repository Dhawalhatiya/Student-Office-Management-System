import { requireStudent } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "My Documents" };

export default async function Page() {
  await requireStudent();
  return <PlannedPage title="My Documents" phase="Phase 4" summary="Private document upload with review status." items={["Upload with type and size checks", "Protected downloads for approved documents", ]} />;
}
