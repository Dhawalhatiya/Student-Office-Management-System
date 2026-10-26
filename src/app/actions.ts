"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { createSession, destroySession, getClientIp, getCurrentUser, homeFor } from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string; fieldErrors?: { email?: string; password?: string } };

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address.").max(254),
  password: z.string().min(1, "Enter your password.").max(200),
  portal: z.enum(["student", "staff"]).optional(),
  next: z.string().max(200).optional(),
});

// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = "$2b$12$b.O9VaaL3Bjq4koxdyR.w.yc6.Akxi6CnmSA9OmX25.NJngBYLLou";

const WINDOW_MS = 15 * 60_000;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    portal: formData.get("portal") || undefined,
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { fieldErrors: { email: f.email?.[0], password: f.password?.[0] } };
  }
  const { email, password, portal, next } = parsed.data;
  const ip = (await getClientIp()) ?? "unknown";
  const emailKey = `login:${ip}:${email.toLowerCase()}`;
  const ipKey = `login-ip:${ip}`;

  const a = rateLimit(emailKey, 5, WINDOW_MS);
  const b = rateLimit(ipKey, 30, WINDOW_MS);
  if (!a.allowed || !b.allowed) {
    const mins = Math.ceil(Math.max(a.retryAfterSec, b.retryAfterSec) / 60);
    await audit({ action: "LOGIN_RATE_LIMITED", summary: "Login temporarily blocked after repeated attempts", ip });
    return { error: `Too many sign-in attempts. Try again in about ${mins} minute${mins === 1 ? "" : "s"}.` };
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.isActive) {
    await audit({ actorId: user?.id ?? null, action: "LOGIN_FAILED", summary: "Failed sign-in attempt", ip });
    return { error: "Email or password is incorrect." };
  }

  resetRateLimit(emailKey);
  await createSession(user.id);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const mismatch = portal && ((portal === "staff") !== (user.role === "STAFF"));
  await audit({
    actorId: user.id, action: "LOGIN_SUCCESS", ip,
    summary: mismatch ? `Signed in (selected ${portal} portal; account role ${user.role} applied)` : "Signed in",
  });

  const home = homeFor(user.role);
  // Only follow same-site paths inside the account's own portal (prevents open redirects and portal hopping).
  const safeNext = next && next.startsWith(home) && !next.startsWith("//") ? next : home;
  redirect(safeNext);
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await destroySession();
  if (user) await audit({ actorId: user.id, action: "LOGOUT", summary: "Signed out", ip: await getClientIp() });
  redirect("/login?signedout=1");
}
