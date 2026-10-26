import { apiUser } from "@/lib/auth";
import { getStaffDashboard } from "@/lib/metrics";
import { permissionsFor } from "@/lib/permissions";

export async function GET() {
  const auth = await apiUser({ role: "STAFF" });
  if ("error" in auth) return auth.error;
  const { user } = auth;
  const d = await getStaffDashboard(permissionsFor(user.staffRole!));
  return Response.json({
    totalStudents: d.totalStudents,
    fees: d.fees?.map((f) => ({ status: f.status, count: f._count._all })) ?? null,
    pendingRequests: d.requests?.pending ?? null,
    documentsAwaitingReview: d.docsAwaiting,
    scholarshipDocumentsAwaitingReview: d.scholarshipDocsAwaiting,
  });
}
