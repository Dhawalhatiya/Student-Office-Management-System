import type { StaffRole } from "@prisma/client";

/**
 * Permission model. There are two roles (STUDENT, STAFF). Inside STAFF, the
 * staff group (StaffRole) decides which permissions apply - least privilege.
 * There is deliberately no Super Admin.
 */
export type Permission =
  | "students.read" | "students.write"
  | "fees.read" | "fees.write"
  | "results.read" | "results.write" | "results.publish"
  | "requests.read" | "requests.manage"
  | "documents.review"
  | "scholarships.read" | "scholarships.manage"
  | "reports.export"
  | "ai.assistant"
  | "audit.read";

export const STAFF_PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
  STUDENT_OFFICE: [
    "students.read", "students.write", "fees.read", "results.read",
    "requests.read", "requests.manage", "documents.review",
    "scholarships.read", "scholarships.manage", "reports.export",
    "ai.assistant", "audit.read",
  ],
  FINANCE: [
    "students.read", "fees.read", "fees.write", "requests.read",
    "reports.export", "ai.assistant",
  ],
  EXAMINATION: [
    "students.read", "results.read", "results.write", "results.publish",
    "requests.read", "reports.export",
  ],
  ACADEMIC: [
    "students.read", "results.read", "scholarships.read", "requests.read",
    "reports.export",
  ],
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  STUDENT_OFFICE: "Student Office",
  FINANCE: "Finance",
  EXAMINATION: "Examination",
  ACADEMIC: "Academic / Programme",
};

export function permissionsFor(staffRole: StaffRole): readonly Permission[] {
  return STAFF_PERMISSIONS[staffRole];
}

export function can(staffRole: StaffRole | null | undefined, permission: Permission): boolean {
  if (!staffRole) return false;
  return STAFF_PERMISSIONS[staffRole].includes(permission);
}
