import { requireStaff } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Requests" };

export default async function Page() {
  await requireStaff("requests.read");
  return <PlannedPage title="Requests" phase="Phase 5" summary="The request queue with assignment, replies and status changes." items={["Search and filters", "Assign, reply, resolve, close and reopen", ]} />;
}
