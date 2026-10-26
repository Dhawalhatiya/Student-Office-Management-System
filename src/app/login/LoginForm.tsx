"use client";

import { useActionState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "../actions";

type Demo = { label: string; email: string; password: string };

export default function LoginForm({ portal, next, demoAccounts }: { portal?: string; next?: string; demoAccounts: Demo[] }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <form action={action} noValidate className="space-y-4">
        {portal && <input type="hidden" name="portal" value={portal} />}
        {next && <input type="hidden" name="next" value={next} />}

        {state.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900">{state.error}</p>}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input ref={emailRef} id="email" name="email" type="email" autoComplete="username" required className="input"
            aria-invalid={!!state.fieldErrors?.email} aria-describedby={state.fieldErrors?.email ? "email-err" : undefined} />
          {state.fieldErrors?.email && <p id="email-err" className="mt-1 text-sm text-red-800">{state.fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input ref={passRef} id="password" name="password" type="password" autoComplete="current-password" required className="input"
            aria-invalid={!!state.fieldErrors?.password} aria-describedby={state.fieldErrors?.password ? "pw-err" : undefined} />
          {state.fieldErrors?.password && <p id="pw-err" className="mt-1 text-sm text-red-800">{state.fieldErrors.password}</p>}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" size={16} aria-hidden />} {pending ? "Signing in" : "Sign in"}
        </button>
      </form>

      {demoAccounts.length > 0 && (
        <div className="mt-6 border-t border-line pt-4">
          <p className="text-sm font-semibold">Demo accounts (development only)</p>
          <p className="mt-1 text-xs text-muted">Fictional accounts for demonstration. These are not production credentials.</p>
          <ul className="mt-3 space-y-2">
            {demoAccounts.map((a) => (
              <li key={a.email} className="flex items-center justify-between gap-3 text-sm">
                <span><span className="font-medium">{a.label}</span><br /><span className="text-xs text-muted">{a.email}</span></span>
                <button type="button" className="btn btn-outline !px-3 !py-1.5"
                  onClick={() => { if (emailRef.current && passRef.current) { emailRef.current.value = a.email; passRef.current.value = a.password; } }}>
                  Fill
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Student password: DemoStudent123! · Staff password: DemoStaff123!</p>
        </div>
      )}
    </>
  );
}
