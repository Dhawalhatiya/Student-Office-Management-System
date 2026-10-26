import { requireStudent } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "My Requests" };

export default async function Page() {
  await requireStudent();
  return <PlannedPage title="My Requests" phase="Phase 5" summary="Request tracking, replies and attachments." items={["Search and filters", "Staff replies and timeline", "Reopen a resolved request", ]} />;
}
