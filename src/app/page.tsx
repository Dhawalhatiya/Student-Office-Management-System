import Link from "next/link";
import { ArrowRight, Bell, FileCheck2, GraduationCap, Receipt, ShieldCheck, Users, Database, MessageSquare } from "lucide-react";

const BENEFITS = [
  { icon: Database, title: "Centralised student information", text: "Profile, enrollment, fees, results and documents in one record instead of several disconnected platforms." },
  { icon: MessageSquare, title: "Online administrative requests", text: "Submit a request, attach documents and follow it to resolution without visiting the office." },
  { icon: Receipt, title: "Fee and receipt access", text: "See what is paid, what is due and download receipts for verified payments." },
  { icon: GraduationCap, title: "Examination result access", text: "View published semester results with SGPA and CGPA. Drafts are never shown." },
  { icon: FileCheck2, title: "Document tracking", text: "Know whether each uploaded document is under review, verified or needs replacing." },
  { icon: Bell, title: "Faster communication", text: "Replies and status changes arrive as notifications, with a full history on every request." },
];

export default function Home() {
  return (
    <div>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="font-[family-name:var(--font-display)] text-lg text-brand-900">Student Office Management System</span>
          <nav className="flex gap-2" aria-label="Portal login">
            <Link href="/login?portal=student" className="btn btn-outline">Student login</Link>
            <Link href="/login?portal=staff" className="btn btn-primary">Staff login</Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="bg-brand-900 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div>
              <p className="text-sm text-brand-200">Avantika University</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Student Office Management System</h1>
              <p className="mt-5 max-w-xl text-lg text-brand-100">
                Student records, fees, examination results, documents and administrative requests, handled in one place instead of through email, office visits and separate platforms.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login?portal=student" className="btn bg-white !text-brand-900 hover:!bg-brand-50">Open Student Portal</Link>
                <Link href="/login?portal=staff" className="btn border-white/40 text-white hover:bg-brand-800">Open Staff Portal</Link>
              </div>
            </div>

            {/* A sample request, since tracking requests is the core of the system */}
            <figure className="rounded-xl bg-white p-5 text-ink shadow-xl" aria-label="Sample request timeline, fictional">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Enrollment verification letter</span>
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">Resolved</span>
              </div>
              <p className="mt-1 text-xs text-muted">REQ-2026-0003 · Priority low</p>
              <ol className="mt-4 space-y-3 border-l-2 border-brand-200 pl-4 text-sm">
                <li><span className="font-medium">Submitted</span><span className="block text-xs text-muted">Student attached a bank letter</span></li>
                <li><span className="font-medium">Under review</span><span className="block text-xs text-muted">Assigned to Student Office</span></li>
                <li><span className="font-medium">Resolved</span><span className="block text-xs text-muted">Verification letter issued</span></li>
              </ol>
              <figcaption className="mt-4 text-xs text-muted">Sample with fictional data.</figcaption>
            </figure>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="benefits">
          <h2 id="benefits" className="text-2xl font-semibold sm:text-3xl">What changes for students and staff</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 border-t border-line pt-5">
                <Icon className="mt-1 shrink-0 text-brand-600" size={22} aria-hidden />
                <div>
                  <dt className="font-semibold">{title}</dt>
                  <dd className="mt-1 text-sm text-muted">{text}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-y border-line bg-white" aria-labelledby="portals">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 id="portals" className="text-2xl font-semibold sm:text-3xl">Choose your portal</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">Choosing a portal does not grant access. After you sign in, your account decides which portal opens.</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <article className="panel p-6">
                <Users className="text-brand-600" size={26} aria-hidden />
                <h3 className="mt-3 text-xl font-semibold">Student Portal</h3>
                <p className="mt-2 text-sm text-muted">View your profile, fees and receipts, published results, documents, scholarships and requests.</p>
                <Link href="/login?portal=student" className="btn btn-primary mt-5">Student login <ArrowRight size={16} aria-hidden /></Link>
              </article>
              <article className="panel p-6">
                <ShieldCheck className="text-brand-600" size={26} aria-hidden />
                <h3 className="mt-3 text-xl font-semibold">Administrative Staff Portal</h3>
                <p className="mt-2 text-sm text-muted">Manage student records, fees, results, documents, scholarships and the request queue. Access depends on your staff group.</p>
                <Link href="/login?portal=staff" className="btn btn-primary mt-5">Staff login <ArrowRight size={16} aria-hidden /></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="privacy">
          <div className="rounded-lg border border-gold/40 bg-gold-50 p-5 text-sm">
            <h2 id="privacy" className="text-base font-semibold">Privacy and demo notice</h2>
            <p className="mt-1">
              This is an academic demonstration. Every student, payment, result, document and request shown is fictional. Do not enter real personal, payment or identity information. Demo sign-in details are available on the login page only while the application runs in demo mode.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-brand-900 text-brand-100">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-4 py-6 text-sm sm:px-6">
          <span>Avantika University</span>
          <span>Project Design</span>
          <span>Demo application. Not for production use with real data.</span>
        </div>
      </footer>
    </div>
  );
}
