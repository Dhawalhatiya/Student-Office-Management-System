import { db } from "./db";
import type { Permission } from "./permissions";

const OPEN_REQUEST_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "WAITING_FOR_STUDENT"] as const;

/** Every query is scoped by studentId, which always comes from the authenticated session. */
export async function getStudentDashboard(studentId: string, userId: string) {
  const student = await db.student.findUniqueOrThrow({
    where: { id: studentId },
    include: { programme: true, department: true, academicYear: true },
  });

  const currentFee = await db.feeRecord.findFirst({
    where: { studentId, academicYear: { isCurrent: true } },
    include: { payments: { where: { status: "VERIFIED" } } },
    orderBy: { dueDate: "desc" },
  });
  const paid = currentFee?.payments.reduce((s, p) => s + p.amount, 0) ?? 0;

  const latestResult = await db.result.findFirst({
    where: { studentId, status: "PUBLISHED" }, // students only ever see published results
    include: { semester: true, academicYear: true },
    orderBy: [{ academicYear: { startDate: "desc" } }, { semester: { number: "desc" } }],
  });

  const [openRequests, docsNeedingAttention, notifications, unread] = await Promise.all([
    db.studentRequest.count({ where: { studentId, status: { in: [...OPEN_REQUEST_STATUSES] } } }),
    db.document.count({ where: { studentId, status: { in: ["REJECTED", "REPLACEMENT_REQUIRED"] } } }),
    db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.notification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    student,
    fee: currentFee
      ? {
          status: currentFee.status,
          total: currentFee.totalAmount,
          paid,
          balance: Math.max(currentFee.totalAmount - paid, 0),
          dueDate: currentFee.dueDate,
          description: currentFee.description,
        }
      : null,
    latestResult,
    openRequests,
    docsNeedingAttention,
    notifications,
    unread,
  };
}

/** Staff metrics. Sections the staff group is not permitted to see are returned as null. */
export async function getStaffDashboard(perms: readonly Permission[]) {
  const has = (p: Permission) => perms.includes(p);

  const totalStudents = has("students.read") ? await db.student.count() : null;

  const fees = has("fees.read")
    ? await db.feeRecord.groupBy({ by: ["status"], where: { academicYear: { isCurrent: true } }, _count: { _all: true } })
    : null;

  const requests = has("requests.read")
    ? {
        byStatus: await db.studentRequest.groupBy({ by: ["status"], _count: { _all: true } }),
        byPriority: await db.studentRequest.groupBy({
          by: ["priority"],
          where: { status: { in: [...OPEN_REQUEST_STATUSES] } },
          _count: { _all: true },
        }),
        pending: await db.studentRequest.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
        recent: await db.studentRequest.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { student: { select: { fullName: true, enrollmentNo: true } }, assignedTo: { select: { name: true } } },
        }),
      }
    : null;

  const docsAwaiting = has("documents.review")
    ? await db.document.count({ where: { status: { in: ["UPLOADED", "UNDER_REVIEW"] } } })
    : null;

  const scholarshipDocsAwaiting = has("scholarships.read")
    ? await db.scholarshipDocument.count({ where: { status: { in: ["UPLOADED", "UNDER_REVIEW"] } } })
    : null;

  const recentActivity = has("audit.read")
    ? await db.auditLog.findMany({
        where: { action: { notIn: ["ACCESS_DENIED", "LOGIN_FAILED"] } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { actor: { select: { name: true } } },
      })
    : null;

  return { totalStudents, fees, requests, docsAwaiting, scholarshipDocsAwaiting, recentActivity };
}
