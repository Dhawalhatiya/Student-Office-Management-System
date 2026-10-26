"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award, BarChart3, Bell, FolderOpen, GraduationCap, HelpCircle, LayoutDashboard, ListChecks,
  LogOut, Menu, Receipt, Search, Settings, Sparkles, User, Users, X, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard, user: User, receipt: Receipt, graduation: GraduationCap, requests: ListChecks,
  files: FolderOpen, award: Award, bell: Bell, help: HelpCircle, search: Search, users: Users,
  chart: BarChart3, sparkles: Sparkles, settings: Settings,
};

export type ShellNavItem = { href: string; label: string; icon: string };

type Props = {
  portalLabel: string;
  homeHref: string;
  nav: ShellNavItem[];
  user: { name: string; subtitle: string };
  unread: number;
  searchAction?: string;
  searchPlaceholder?: string;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
};

export default function AppShell({ portalLabel, homeHref, nav, user, unread, searchAction, searchPlaceholder, logoutAction, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => (href === homeHref ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  const links = (
    <nav aria-label={`${portalLabel} navigation`} className="flex flex-col gap-0.5 px-3">
      {nav.map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
              active ? "bg-white text-brand-900" : "text-brand-100 hover:bg-brand-800"
            }`}
          >
            <Icon size={18} aria-hidden />
            {item.label}
            {item.icon === "bell" && unread > 0 && (
              <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-white" aria-label={`${unread} unread`}>{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link href={homeHref} className="block px-6 py-5">
      <span className="block font-[family-name:var(--font-display)] text-lg leading-tight text-white">Student Office Management System</span>
      <span className="mt-1 block text-xs text-brand-200">Avantika University · {portalLabel}</span>
    </Link>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-brand-900 lg:block">
        <div className="sticky top-0 flex h-screen flex-col overflow-y-auto pb-6">
          {brand}
          {links}
        </div>
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto bg-brand-900 pb-6">
            <button className="absolute right-3 top-4 text-white" aria-label="Close menu" onClick={() => setOpen(false)}><X size={22} /></button>
            {brand}
            {links}
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-6">
          <button className="rounded-lg border border-line p-2 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          {searchAction ? (
            <form action={searchAction} method="get" role="search" className="relative max-w-md flex-1">
              <label htmlFor="global-search" className="sr-only">Search students</label>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
              <input id="global-search" name="q" maxLength={64} placeholder={searchPlaceholder} className="input pl-9" />
            </form>
          ) : (
            <div className="flex-1" />
          )}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold leading-tight">{user.name}</div>
              <div className="text-xs text-muted">{user.subtitle}</div>
            </div>
            <form action={logoutAction}>
              <button className="btn btn-outline !px-3 !py-2" type="submit"><LogOut size={16} aria-hidden /> <span className="hidden sm:inline">Sign out</span><span className="sr-only sm:hidden">Sign out</span></button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <footer className="px-6 pb-8 text-center text-xs text-muted">Demo application · all data shown is fictional · Avantika University academic project</footer>
      </div>
    </div>
  );
}
