import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, StaffRole } from "@prisma/client";
import { db } from "./db";
import { audit } from "./audit";
import { can, type Permission } from "./permissions";

export const SESSION_COOKIE = "som_session";
const SESSION_HOURS = Number(process.env.SESSION_HOURS ?? 8);

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  staffRole: StaffRole | null;
  designation: string | null;
  studentId: string | null;
};

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  // Only trust x-forwarded-for when deployed behind your own reverse proxy.
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);
  const h = await headers();
  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      ip: await getClientIp(),
      userAgent: h.get("user-agent")?.slice(0, 200) ?? null,
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}

/** Resolves the signed-in user from the session cookie. The role comes from the database, never from the client. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return userFromToken(token);
});

export async function userFromToken(token: string): Promise<CurrentUser | null> {
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { staffProfile: true, student: { select: { id: true } } } } },
  });
  if (!session || session.expiresAt <= new Date() || !session.user.isActive) return null;
  const u = session.user;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    staffRole: u.staffProfile?.staffRole ?? null,
    designation: u.staffProfile?.designation ?? null,
    studentId: u.student?.id ?? null,
  };
}

export const homeFor = (role: Role) => (role === "STAFF" ? "/staff" : "/student");

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Student pages: staff are sent to their own portal; students only ever get their own record. */
export async function requireStudent() {
  const user = await requireUser();
  if (user.role !== "STUDENT" || !user.studentId) {
    await audit({ actorId: user.id, action: "ACCESS_DENIED", summary: "Non-student attempted to open the student portal", ip: await getClientIp() });
    redirect(homeFor(user.role));
  }
  return { user, studentId: user.studentId };
}

/** Staff pages. Pass a permission to enforce least privilege inside the staff portal. */
export async function requireStaff(permission?: Permission) {
  const user = await requireUser();
  if (user.role !== "STAFF" || !user.staffRole) {
    await audit({ actorId: user.id, action: "ACCESS_DENIED", summary: "Student attempted to open the staff portal", ip: await getClientIp() });
    redirect(homeFor(user.role));
  }
  if (permission && !can(user.staffRole, permission)) {
    await audit({ actorId: user.id, action: "ACCESS_DENIED", summary: `Missing permission ${permission}`, ip: await getClientIp() });
    redirect(`/staff/access-denied?need=${encodeURIComponent(permission)}`);
  }
  return { user, staffRole: user.staffRole };
}

/** For route handlers: returns JSON-friendly results instead of redirecting. */
export async function apiUser(opts: { role: Role; permission?: Permission }) {
  const user = await getCurrentUser();
  if (!user) return { error: Response.json({ error: "Authentication required." }, { status: 401 }) } as const;
  const ok = user.role === opts.role && (!opts.permission || can(user.staffRole, opts.permission));
  if (!ok) {
    await audit({ actorId: user.id, action: "ACCESS_DENIED", summary: `API access denied (${opts.role}${opts.permission ? ":" + opts.permission : ""})`, ip: await getClientIp() });
    return { error: Response.json({ error: "You do not have access to this resource." }, { status: 403 }) } as const;
  }
  return { user } as const;
}
