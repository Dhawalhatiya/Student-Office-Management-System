import { requireStaff } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "AI Data Assistant" };

export default async function Page() {
  await requireStaff("ai.assistant");
  return <PlannedPage title="AI Data Assistant" phase="Phase 7" summary="A chat interface that turns requests into validated report filters, with confirmation before any export. It never runs free-form SQL and never changes records." items={["Preview and confirm before export", "Demo mode when no AI key is configured", ]} />;
}
