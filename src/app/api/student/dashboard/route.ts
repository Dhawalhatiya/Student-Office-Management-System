import { apiUser } from "@/lib/auth";
import { getStudentDashboard } from "@/lib/metrics";

export async function GET() {
  const auth = await apiUser({ role: "STUDENT" });
  if ("error" in auth) return auth.error;
  const { user } = auth;
  if (!user.studentId) return Response.json({ error: "No student record is linked to this account." }, { status: 403 });
  const d = await getStudentDashboard(user.studentId, user.id);
  return Response.json({
    enrollmentNo: d.student.enrollmentNo, fee: d.fee, openRequests: d.openRequests,
    documentsNeedingAttention: d.docsNeedingAttention,
    latestResult: d.latestResult ? { semester: d.latestResult.semester.number, sgpa: d.latestResult.sgpa, cgpa: d.latestResult.cgpa } : null,
  });
}
