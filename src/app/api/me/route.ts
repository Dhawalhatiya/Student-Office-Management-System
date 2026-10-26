import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  return Response.json({ id: user.id, name: user.name, email: user.email, role: user.role, staffRole: user.staffRole });
}
