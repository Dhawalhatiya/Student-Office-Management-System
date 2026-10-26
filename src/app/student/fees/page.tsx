import { requireStudent } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Fees and Receipts" };

export default async function Page() {
  await requireStudent();
  return <PlannedPage title="Fees and Receipts" phase="Phase 4" summary="Fee status, payment history and receipt downloads will be built on the fee, payment and receipt tables that already exist in the database." items={["Overall fee status (paid, unpaid, partial)", "Payment history with references and dates", "PDF receipts for verified payments", ]} />;
}
