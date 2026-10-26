import { requireStudent } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Submit a request" };

export default async function Page() {
  await requireStudent();
  return <PlannedPage title="Submit a request" phase="Phase 5" summary="The request form with category, priority, attachment and an automatically generated ticket number." items={["Category, subject, description and priority", "Attachment upload", "Confirmation with ticket number and expected processing time", ]} />;
}
