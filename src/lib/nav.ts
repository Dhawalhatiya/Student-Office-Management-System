import type { Permission } from "./permissions";

export type NavItem = { href: string; label: string; icon: string; permission?: Permission };

export const STUDENT_NAV: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: "dashboard" },
  { href: "/student/profile", label: "My Profile", icon: "user" },
  { href: "/student/fees", label: "Fees and Receipts", icon: "receipt" },
  { href: "/student/results", label: "Examination Results", icon: "graduation" },
  { href: "/student/requests", label: "My Requests", icon: "requests" },
  { href: "/student/documents", label: "My Documents", icon: "files" },
  { href: "/student/scholarships", label: "Scholarships", icon: "award" },
  { href: "/student/notifications", label: "Notifications", icon: "bell" },
  { href: "/student/help", label: "Help and FAQs", icon: "help" },
];

export const STAFF_NAV: NavItem[] = [
  { href: "/staff", label: "Dashboard", icon: "dashboard" },
  { href: "/staff/students", label: "Student Search", icon: "search", permission: "students.read" },
  { href: "/staff/records", label: "Student Records", icon: "users", permission: "students.read" },
  { href: "/staff/fees", label: "Fees and Receipts", icon: "receipt", permission: "fees.read" },
  { href: "/staff/results", label: "Results", icon: "graduation", permission: "results.read" },
  { href: "/staff/requests", label: "Requests", icon: "requests", permission: "requests.read" },
  { href: "/staff/documents", label: "Documents", icon: "files", permission: "documents.review" },
  { href: "/staff/scholarships", label: "Scholarships", icon: "award", permission: "scholarships.read" },
  { href: "/staff/reports", label: "Reports and Exports", icon: "chart", permission: "reports.export" },
  { href: "/staff/assistant", label: "AI Data Assistant", icon: "sparkles", permission: "ai.assistant" },
  { href: "/staff/notifications", label: "Notifications", icon: "bell" },
  { href: "/staff/settings", label: "Settings", icon: "settings" },
];
