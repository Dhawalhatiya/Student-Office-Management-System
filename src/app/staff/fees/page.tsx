import { requireStaff } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Fees and Receipts" };

export default async function Page() {
  await requireStaff("fees.read");
  return <PlannedPage title="Fees and Receipts" phase="Phase 4" summary="Fee records, instalments, payment verification and PDF receipts." items={["Record and verify payments", "Generate receipts for verified payments", ]} />;
}
