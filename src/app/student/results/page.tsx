import { requireStudent } from "@/lib/auth";
import { PlannedPage } from "@/components/ui";

export const metadata = { title: "Examination Results" };

export default async function Page() {
  await requireStudent();
  return <PlannedPage title="Examination Results" phase="Phase 4" summary="Semester-wise results will show published results only." items={["Marks, grades, credits, SGPA and CGPA", "Result statement download", ]} />;
}
