import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { DEMO_ACCOUNTS, isDemoMode } from "@/lib/demo";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ portal?: string; next?: string; signedout?: string }> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));

  const portal = sp.portal === "staff" ? "staff" : sp.portal === "student" ? "student" : undefined;
  const title = portal === "staff" ? "Administrative Staff Portal" : portal === "student" ? "Student Portal" : "Sign in";
  // Demo credentials are only sent to the browser in demo mode.
  const demo = isDemoMode() ? DEMO_ACCOUNTS.filter((a) => !portal || a.portal === portal) : [];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-6 text-sm text-brand-700 underline">Back to home</Link>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted">Student Office Management System · Avantika University</p>

      {sp.signedout && <p role="status" className="mt-5 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">You have been signed out.</p>}

      <div className="panel mt-6 p-6">
        <LoginForm portal={portal} next={sp.next} demoAccounts={demo.map(({ label, email, password }) => ({ label, email, password }))} />
      </div>
      <p className="mt-4 text-xs text-muted">Your account decides which portal opens. Selecting a portal does not grant access to it.</p>
    </div>
  );
}
