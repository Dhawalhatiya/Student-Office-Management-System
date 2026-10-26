import type { ReactNode } from "react";
import { Hammer } from "lucide-react";
import { titleCase } from "@/lib/format";

const TONES: Record<string, string> = {
  PAID: "bg-brand-100 text-brand-800", VERIFIED: "bg-brand-100 text-brand-800", PUBLISHED: "bg-brand-100 text-brand-800",
  RESOLVED: "bg-brand-100 text-brand-800", ACTIVE: "bg-brand-100 text-brand-800", COMPLETE: "bg-brand-100 text-brand-800",
  PARTIAL: "bg-gold-50 text-[#7a5a14]", UNDER_REVIEW: "bg-gold-50 text-[#7a5a14]", WAITING_FOR_STUDENT: "bg-gold-50 text-[#7a5a14]",
  APPROVED: "bg-sky-100 text-sky-900", PENDING: "bg-gold-50 text-[#7a5a14]", IN_PROGRESS: "bg-gold-50 text-[#7a5a14]",
  UNPAID: "bg-red-100 text-red-900", REJECTED: "bg-red-100 text-red-900", REPLACEMENT_REQUIRED: "bg-red-100 text-red-900",
  URGENT: "bg-red-100 text-red-900", HIGH: "bg-orange-100 text-orange-900",
  SUBMITTED: "bg-sky-100 text-sky-900", UPLOADED: "bg-sky-100 text-sky-900", DRAFT: "bg-neutral-200 text-neutral-800",
  CLOSED: "bg-neutral-200 text-neutral-800", LOW: "bg-neutral-200 text-neutral-800", MEDIUM: "bg-sky-100 text-sky-900",
  ON_LEAVE: "bg-gold-50 text-[#7a5a14]",
};

export function StatusBadge({ value }: { value: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[value] ?? "bg-neutral-200 text-neutral-800"}`}>{titleCase(value)}</span>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Metric({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "warn" | "good" }) {
  return (
    <div className="panel p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tone === "warn" ? "text-[#8a5a00]" : tone === "good" ? "text-brand-700" : ""}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-4 py-8 text-center">
      <p className="font-medium">{title}</p>
      {children && <p className="mt-1 text-sm text-muted">{children}</p>}
    </div>
  );
}

/** Honest placeholder for features scheduled for a later phase. */
export function PlannedPage({ title, phase, summary, items }: { title: string; phase: string; summary: string; items: string[] }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="panel p-6">
        <div className="flex items-start gap-3">
          <Hammer className="mt-0.5 shrink-0 text-gold" size={20} aria-hidden />
          <div>
            <p className="font-medium">Planned for {phase}. This section is not built yet.</p>
            <p className="mt-1 text-sm text-muted">{summary}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              {items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
