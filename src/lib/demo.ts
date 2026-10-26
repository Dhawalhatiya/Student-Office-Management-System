/** Demo credentials are shown only in development or when DEMO_MODE=true. */
export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "true") return true;
  if (process.env.DEMO_MODE === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export const DEMO_ACCOUNTS = [
  { label: "Student", email: "student.demo@example.com", password: "DemoStudent123!", portal: "student" },
  { label: "Staff - Student Office", email: "staff.demo@example.com", password: "DemoStaff123!", portal: "staff" },
  { label: "Staff - Finance", email: "finance.demo@example.com", password: "DemoStaff123!", portal: "staff" },
  { label: "Staff - Examination", email: "exam.demo@example.com", password: "DemoStaff123!", portal: "staff" },
  { label: "Staff - Academic", email: "academic.demo@example.com", password: "DemoStaff123!", portal: "staff" },
] as const;
