/**
 * Fictional demo data for the Student Office Management System.
 * Everything here is invented: names, enrollment numbers (AVU-DEMO-...),
 * payments, documents and requests. Do not use real personal data.
 *
 * Usage: npm run db:seed   (wipes existing rows first)
 */
import bcrypt from "bcryptjs";
import type { DocumentStatus, FeeStatus, Priority, RequestCategory, RequestStatus, ResultStatus } from "@prisma/client";
import { db } from "../src/lib/db";

if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
  console.error("Refusing to seed in production. Set ALLOW_DEMO_SEED=true to override.");
  process.exit(1);
}

// Deterministic PRNG so every seed run produces the same dataset.
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261022);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => Math.floor(a + rand() * (b - a + 1));
const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000);
const ayLabel = (startYear: number) => `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

const gradeFor = (m: number) => (m >= 90 ? ["O", 10] : m >= 80 ? ["A+", 9] : m >= 70 ? ["A", 8] : m >= 60 ? ["B+", 7] : m >= 50 ? ["B", 6] : m >= 40 ? ["C", 5] : ["F", 0]) as [string, number];

const FIRST = ["Aarav", "Diya", "Vihaan", "Anaya", "Reyansh", "Ishita", "Kabir", "Meera", "Arjun", "Saanvi", "Rohan", "Tanvi", "Yash", "Kiara", "Aditya", "Riya", "Dev", "Navya", "Harsh", "Pooja", "Nikhil", "Sneha", "Manav", "Aditi", "Karthik", "Pranav", "Simran", "Tushar", "Ananya", "Veer", "Mitali", "Rahul", "Shreya", "Ujjwal", "Bhavna", "Lakshya"];
const LAST = ["Mehta", "Sharma", "Verma", "Nair", "Iyer", "Patel", "Joshi", "Rao", "Kulkarni", "Chauhan", "Bansal", "Desai", "Menon", "Saxena", "Pillai", "Tiwari", "Gupta", "Reddy", "Bhatt", "Malhotra"];

const COURSE_POOL: Record<string, string[]> = {
  CSE: ["Data Structures", "Algorithms", "Database Systems", "Operating Systems", "Computer Networks", "Software Engineering", "Discrete Mathematics", "Web Technologies", "Machine Learning", "Compiler Design", "Cloud Computing", "Information Security"],
  ECE: ["Circuit Analysis", "Digital Electronics", "Signals and Systems", "Analog Communication", "Microprocessors", "Electromagnetic Theory", "Control Systems", "VLSI Design", "Embedded Systems", "Digital Signal Processing", "Antenna Theory", "Optical Communication"],
  BBA: ["Principles of Management", "Financial Accounting", "Marketing Management", "Business Statistics", "Organisational Behaviour", "Business Law", "Human Resource Management", "Operations Management", "Business Economics", "Entrepreneurship", "Consumer Behaviour", "Business Communication"],
  MBA: ["Managerial Economics", "Corporate Finance", "Strategic Management", "Marketing Analytics", "Operations Research", "Leadership and Ethics", "Supply Chain Management", "Financial Markets", "Business Analytics", "Organisational Design", "International Business", "Project Management"],
};

async function main() {
  // ---- wipe (children first)
  for (const m of [
    "reportExportLog", "notification", "auditLog", "scholarshipDocument", "studentScholarship", "scholarshipRequirement",
    "scholarship", "document", "requestAttachment", "requestMessage", "studentRequest", "courseResult", "result",
    "feeReceipt", "feePayment", "feeRecord", "student", "semester", "academicYear", "programme", "department",
    "session", "staffProfile", "user",
  ] as const) {
    await (db[m] as unknown as { deleteMany: () => Promise<unknown> }).deleteMany();
  }

  const studentHash = await bcrypt.hash("DemoStudent123!", 12);
  const staffHash = await bcrypt.hash("DemoStaff123!", 12);

  // ---- institution
  const depts = {
    CSE: await db.department.create({ data: { code: "CSE", name: "Computer Science and Engineering" } }),
    ECE: await db.department.create({ data: { code: "ECE", name: "Electronics and Communication Engineering" } }),
    MGT: await db.department.create({ data: { code: "MGT", name: "School of Management" } }),
  };
  const progs = {
    CSE: await db.programme.create({ data: { code: "BTECH-CSE", name: "B.Tech Computer Science and Engineering", departmentId: depts.CSE.id, durationSemesters: 8 } }),
    ECE: await db.programme.create({ data: { code: "BTECH-ECE", name: "B.Tech Electronics and Communication Engineering", departmentId: depts.ECE.id, durationSemesters: 8 } }),
    BBA: await db.programme.create({ data: { code: "BBA", name: "Bachelor of Business Administration", departmentId: depts.MGT.id, durationSemesters: 6 } }),
    MBA: await db.programme.create({ data: { code: "MBA", name: "Master of Business Administration", departmentId: depts.MGT.id, durationSemesters: 4 } }),
  };
  const years: Record<number, { id: string }> = {};
  for (const y of [2023, 2024, 2025, 2026]) {
    const ay = await db.academicYear.create({
      data: { label: ayLabel(y), startDate: new Date(Date.UTC(y, 6, 1)), endDate: new Date(Date.UTC(y + 1, 5, 30)), isCurrent: y === 2026 },
    });
    years[y] = ay;
    for (let n = 1; n <= 8; n++) await db.semester.create({ data: { number: n, academicYearId: ay.id } });
  }
  const semesterId = async (startYear: number, n: number) =>
    (await db.semester.findFirstOrThrow({ where: { number: n, academicYearId: years[startYear].id } })).id;

  // ---- staff
  const staffSpecs = [
    { email: "staff.demo@example.com", name: "Ritu Kapoor", staffRole: "STUDENT_OFFICE", designation: "Student Office Officer" },
    { email: "finance.demo@example.com", name: "Karan Malhotra", staffRole: "FINANCE", designation: "Accounts Officer" },
    { email: "exam.demo@example.com", name: "Neha Iyer", staffRole: "EXAMINATION", designation: "Examination Controller (Assistant)" },
    { email: "academic.demo@example.com", name: "Anil Verma", staffRole: "ACADEMIC", designation: "Programme Coordinator" },
  ] as const;
  const staff: Record<string, { id: string }> = {};
  for (const s of staffSpecs) {
    const u = await db.user.create({
      data: { email: s.email, name: s.name, role: "STAFF", passwordHash: staffHash, staffProfile: { create: { staffRole: s.staffRole, designation: s.designation } } },
    });
    staff[s.staffRole] = u;
  }
  const office = staff.STUDENT_OFFICE;

  // ---- students (all fictional)
  type Spec = { prog: keyof typeof progs; batch: number };
  const specs: Spec[] = [];
  for (const b of [2024, 2023, 2025, 2026]) for (let i = 0; i < (b === 2024 ? 5 : 3); i++) specs.push({ prog: "CSE", batch: b });
  for (const b of [2023, 2024, 2025, 2026]) for (let i = 0; i < 2; i++) specs.push({ prog: "ECE", batch: b });
  for (const b of [2024, 2025, 2026]) for (let i = 0; i < 3; i++) specs.push({ prog: "BBA", batch: b });
  for (const b of [2025, 2026]) for (let i = 0; i < 3; i++) specs.push({ prog: "MBA", batch: b });

  const counters: Record<string, number> = {};
  const students: { id: string; userId: string; spec: Spec; curSem: number; enrollmentNo: string; idx: number }[] = [];
  const usedNames = new Set<string>();

  for (let idx = 0; idx < specs.length; idx++) {
    const spec = specs[idx];
    const isDemo = idx === 0; // first CSE 2024 student is the demo student
    const key = `${spec.prog}-${spec.batch}`;
    counters[key] = (counters[key] ?? 0) + 1;
    const enrollmentNo = `AVU-DEMO-${String(spec.batch).slice(2)}-${spec.prog}-${String(counters[key]).padStart(3, "0")}`;
    let name = isDemo ? "Aarav Mehta" : `${pick(FIRST)} ${pick(LAST)}`;
    while (!isDemo && usedNames.has(name)) name = `${pick(FIRST)} ${pick(LAST)}`;
    usedNames.add(name);
    const curSem = (2026 - spec.batch) * 2 + 1;
    const ageBase = spec.prog === "MBA" ? 22 : 18;
    const email = isDemo ? "student.demo@example.com" : `student${String(idx).padStart(2, "0")}.demo@example.com`;
    const status = idx % 17 === 16 ? "ON_LEAVE" : "ACTIVE";
    const user = await db.user.create({ data: { email, name, role: "STUDENT", passwordHash: studentHash } });
    const st = await db.student.create({
      data: {
        userId: user.id,
        enrollmentNo,
        fullName: name,
        dateOfBirth: new Date(Date.UTC(spec.batch - ageBase, between(0, 11), between(1, 28))),
        phone: `+91 90000 ${String(10000 + idx * 37).slice(-5)}`,
        address: "Demo Hostel Block, Sample City (fictional address)",
        departmentId: progs[spec.prog].departmentId,
        programmeId: progs[spec.prog].id,
        admissionYear: spec.batch,
        currentSemester: curSem,
        academicYearId: years[2026].id,
        enrollmentStatus: status,
      },
    });
    students.push({ id: st.id, userId: user.id, spec, curSem, enrollmentNo, idx });
  }

  // ---- fees & payments
  let payN = 0;
  const feeTotals = { CSE: 145000, ECE: 145000, BBA: 95000, MBA: 180000 };
  async function addPayment(feeRecordId: string, amount: number, status: "VERIFIED" | "PENDING", when: Date, method: string) {
    payN++;
    await db.feePayment.create({
      data: {
        feeRecordId, amount, status, paidAt: when, method,
        reference: `DEMO-PAY-${String(payN).padStart(5, "0")}`,
        recordedById: staff.FINANCE.id,
        verifiedById: status === "VERIFIED" ? staff.FINANCE.id : null,
        verifiedAt: status === "VERIFIED" ? when : null,
      },
    });
  }
  for (const s of students) {
    const total = feeTotals[s.spec.prog];
    const mode = s.idx === 0 ? 2 : s.idx % 4; // 0,1 paid, 2 partial, 3 unpaid
    // Previous year: fully paid
    if (s.spec.batch < 2026) {
      const prev = await db.feeRecord.create({
        data: { studentId: s.id, academicYearId: years[2025].id, description: `Tuition and Academic Fee ${ayLabel(2025)}`, totalAmount: total, dueDate: new Date(Date.UTC(2025, 7, 15)), status: "PAID" },
      });
      await addPayment(prev.id, total, "VERIFIED", new Date(Date.UTC(2025, 7, between(1, 12))), pick(["UPI", "Bank transfer", "Card"]));
    }
    const status: FeeStatus = mode <= 1 ? "PAID" : mode === 2 ? "PARTIAL" : "UNPAID";
    const fee = await db.feeRecord.create({
      data: { studentId: s.id, academicYearId: years[2026].id, description: `Tuition and Academic Fee ${ayLabel(2026)}`, totalAmount: total, dueDate: new Date(Date.UTC(2026, 10, 15)), status },
    });
    if (mode === 0) await addPayment(fee.id, total, "VERIFIED", daysAgo(between(40, 80)), "UPI");
    if (mode === 1) {
      await addPayment(fee.id, Math.round(total / 2), "VERIFIED", daysAgo(between(70, 90)), "Bank transfer");
      await addPayment(fee.id, total - Math.round(total / 2), "VERIFIED", daysAgo(between(10, 30)), "Card");
    }
    if (mode === 2) {
      await addPayment(fee.id, Math.round(total / 2), "VERIFIED", daysAgo(s.idx === 0 ? 45 : between(30, 60)), "UPI");
      if (s.idx === 0 || s.idx % 8 === 2) await addPayment(fee.id, Math.round(total / 4), "PENDING", daysAgo(2), "Bank transfer"); // not counted until verified
    }
    if (mode === 3 && s.idx % 8 === 3) await addPayment(fee.id, Math.round(total / 4), "PENDING", daysAgo(1), "UPI");
  }

  // ---- results
  for (const s of students) {
    const pool = COURSE_POOL[s.spec.prog];
    let totalPoints = 0, totalCredits = 0;
    for (let n = 1; n < s.curSem; n++) {
      const startYear = s.spec.batch + Math.floor((n - 1) / 2);
      const isLastCompleted = n === s.curSem - 1;
      let status: ResultStatus = "PUBLISHED";
      if (s.idx !== 0 && isLastCompleted) {
        if (s.idx % 5 === 0) status = "UNDER_REVIEW";
        else if (s.idx % 7 === 0) status = "APPROVED";
        else if (s.idx % 11 === 0) status = "DRAFT";
      }
      const courses = Array.from({ length: 5 }, (_, k) => {
        const marks = between(38, 97);
        const [grade, gp] = gradeFor(marks);
        return { courseCode: `${s.spec.prog}${n}0${k + 1}`, courseName: pool[(n * 5 + k) % pool.length], credits: k < 3 ? 4 : 3, marks, maxMarks: 100, grade, gp };
      });
      const cr = courses.reduce((a, c) => a + c.credits, 0);
      const pts = courses.reduce((a, c) => a + c.credits * c.gp, 0);
      totalCredits += cr; totalPoints += pts;
      await db.result.create({
        data: {
          studentId: s.id, academicYearId: years[startYear].id, semesterId: await semesterId(startYear, n), status,
          sgpa: Math.round((pts / cr) * 100) / 100, cgpa: Math.round((totalPoints / totalCredits) * 100) / 100,
          publishedAt: status === "PUBLISHED" ? new Date(Date.UTC(startYear + (n % 2 === 1 ? 0 : 1), n % 2 === 1 ? 11 : 5, 20)) : null,
          courses: { create: courses.map(({ gp, ...c }) => { void gp; return c; }) },
        },
      });
    }
  }
  // Demo student: an unpublished DRAFT for the current semester (must never appear to the student)
  {
    const demo = students[0];
    const pool = COURSE_POOL.CSE;
    await db.result.create({
      data: {
        studentId: demo.id, academicYearId: years[2026].id, semesterId: await semesterId(2026, 5), status: "DRAFT", sgpa: 8.1, cgpa: 8.2,
        courses: { create: [0, 1, 2].map((k) => ({ courseCode: `CSE50${k + 1}`, courseName: pool[(25 + k) % pool.length], credits: 4, marks: 80 + k, maxMarks: 100, grade: "A+" })) },
      },
    });
  }

  // ---- scholarships
  const mkSch = async (name: string, notes: string, reqs: [string, string, boolean][]) =>
    db.scholarship.create({
      data: {
        name, academicYearId: years[2026].id, eligibilityNotes: notes,
        requirements: { create: reqs.map(([documentType, description, isMandatory]) => ({ documentType, description, isMandatory })) },
      },
      include: { requirements: true },
    });
  const sch1 = await mkSch("Merit-cum-Means Scholarship (Demo)", "Minimum 7.5 CGPA in the previous year and annual family income below the declared limit. Fictional demo rules.", [
    ["Income certificate", "Issued within the last 12 months", true],
    ["Previous-year marksheet", "Published marksheet of the previous academic year", true],
    ["Fee receipt", "Receipt for the current academic year", true],
    ["Bank proof", "Cancelled cheque or first page of passbook", true],
  ]);
  const sch2 = await mkSch("State Domicile Support Scheme (Demo)", "For students who are domiciled in the state. Fictional demo rules.", [
    ["Domicile certificate", "Issued by the competent authority", true],
    ["Income certificate", "Issued within the last 12 months", true],
    ["Bank proof", "Cancelled cheque or first page of passbook", true],
  ]);
  await mkSch("Category Welfare Scholarship (Demo)", "For eligible reserved-category students. Fictional demo rules.", [
    ["Caste certificate", "Only where applicable", false],
    ["Income certificate", "Issued within the last 12 months", true],
    ["Previous-year marksheet", "Published marksheet of the previous academic year", true],
  ]);

  // ---- documents (records only: fictional rows have no stored file yet)
  const mkDoc = (studentId: string, type: string, status: DocumentStatus, note?: string, ago = between(3, 40)) =>
    db.document.create({
      data: {
        studentId, type, status, originalName: `${type.toLowerCase().replace(/[^a-z]+/g, "_")}_demo.pdf`, reviewNote: note ?? null,
        uploadedAt: daysAgo(ago), reviewedAt: ["VERIFIED", "REJECTED", "REPLACEMENT_REQUIRED"].includes(status) ? daysAgo(Math.max(ago - 2, 0)) : null,
        reviewedById: ["VERIFIED", "REJECTED", "REPLACEMENT_REQUIRED"].includes(status) ? office.id : null,
        mimeType: "application/pdf",
      },
    });
  const demo = students[0];
  const dMark = await mkDoc(demo.id, "Previous-year marksheet", "VERIFIED", undefined, 30);
  const dInc = await mkDoc(demo.id, "Income certificate", "UNDER_REVIEW", undefined, 6);
  const dBank = await mkDoc(demo.id, "Bank proof", "REJECTED", "Image is unclear. Please upload a sharper scan.", 12);
  const dRcpt = await mkDoc(demo.id, "Fee receipt", "UPLOADED", undefined, 1);
  const demoSS = await db.studentScholarship.create({ data: { studentId: demo.id, scholarshipId: sch1.id, status: "IN_PROGRESS" } });
  for (const [type, doc] of [["Previous-year marksheet", dMark], ["Income certificate", dInc], ["Bank proof", dBank], ["Fee receipt", dRcpt]] as const) {
    await db.scholarshipDocument.create({
      data: { studentScholarshipId: demoSS.id, requirementId: sch1.requirements.find((r) => r.documentType === type)!.id, documentId: doc.id, status: doc.status, note: doc.reviewNote },
    });
  }
  await db.studentScholarship.create({ data: { studentId: demo.id, scholarshipId: sch2.id, status: "IN_PROGRESS" } });

  const docTypes = ["Income certificate", "Domicile certificate", "Previous-year marksheet", "Fee receipt", "Bank proof"];
  const docStates: DocumentStatus[] = ["UPLOADED", "UNDER_REVIEW", "VERIFIED", "REJECTED", "REPLACEMENT_REQUIRED", "VERIFIED"];
  for (const s of students.slice(1)) {
    if (s.idx % 3 !== 0) continue;
    const ss = await db.studentScholarship.create({ data: { studentId: s.id, scholarshipId: sch1.id, status: s.idx % 2 ? "SUBMITTED" : "IN_PROGRESS" } });
    for (const req of sch1.requirements.slice(0, between(2, 4))) {
      const st = pick(docStates);
      const d = await mkDoc(s.id, req.documentType, st, st === "REJECTED" ? "Document does not match the requirement." : st === "REPLACEMENT_REQUIRED" ? "Please upload a recent copy." : undefined);
      await db.scholarshipDocument.create({ data: { studentScholarshipId: ss.id, requirementId: req.id, documentId: d.id, status: st, note: d.reviewNote } });
    }
  }
  for (const s of students.slice(1)) {
    if (s.idx % 4 === 1) await mkDoc(s.id, pick(docTypes), pick(docStates), undefined);
  }

  // ---- requests
  let ticketN = 0;
  const ttl: Record<Priority, number> = { URGENT: 1, HIGH: 2, MEDIUM: 5, LOW: 7 };
  async function mkReq(studentIdx: number, category: RequestCategory, subject: string, description: string, priority: Priority, status: RequestStatus, assigned: boolean, ago: number) {
    ticketN++;
    const s = students[studentIdx];
    const created = daysAgo(ago);
    return db.studentRequest.create({
      data: {
        ticketNo: `REQ-2026-${String(ticketN).padStart(4, "0")}`, studentId: s.id, category, subject, description, priority, status,
        assignedToId: assigned ? office.id : null, createdAt: created, expectedBy: new Date(created.getTime() + ttl[priority] * 86400_000),
        resolvedAt: status === "RESOLVED" || status === "CLOSED" ? daysAgo(Math.max(ago - 2, 0)) : null,
        resolutionNote: status === "RESOLVED" || status === "CLOSED" ? "Verification letter has been issued and shared with the student." : null,
      },
    });
  }
  const r1 = await mkReq(0, "FEE_QUERY", "Instalment receipt not visible", "I paid the second instalment last week but the receipt is not visible yet. Please check the payment status.", "MEDIUM", "SUBMITTED", false, 1);
  const r2 = await mkReq(0, "PROFILE_CORRECTION", "Correct spelling of my name", "My surname is misspelt in my profile. Please correct it.", "HIGH", "WAITING_FOR_STUDENT", true, 5);
  const r3 = await mkReq(0, "ENROLLMENT_VERIFICATION", "Enrollment verification letter", "I need an enrollment verification letter for a bank education-loan application.", "LOW", "RESOLVED", true, 14);
  await db.requestMessage.createMany({
    data: [
      { requestId: r2.id, authorId: office.id, body: "Thanks. Please upload a scan of your Class 10 certificate so we can confirm the correct spelling.", createdAt: daysAgo(4) },
      { requestId: r2.id, authorId: office.id, body: "Internal: ID proof on file shows the spelling the student mentions. Awaiting certificate.", isInternal: true, createdAt: daysAgo(4) },
      { requestId: r3.id, authorId: office.id, body: "Your verification letter is ready. We have attached it to this request.", createdAt: daysAgo(12) },
    ],
  });
  const reqSpecs: [RequestCategory, string, Priority, RequestStatus][] = [
    ["FEE_QUERY", "Late fee waiver query", "HIGH", "UNDER_REVIEW"], ["RESULT_QUERY", "Marks mismatch in Data Structures", "URGENT", "SUBMITTED"],
    ["CERTIFICATE_REQUEST", "Bonafide certificate", "LOW", "UNDER_REVIEW"], ["SCHOLARSHIP", "Scholarship document deadline", "MEDIUM", "WAITING_FOR_STUDENT"],
    ["DOCUMENT_REQUEST", "Duplicate ID card", "MEDIUM", "RESOLVED"], ["GENERAL_QUERY", "Timetable clarification", "LOW", "CLOSED"],
    ["PROFILE_CORRECTION", "Update phone number", "LOW", "SUBMITTED"], ["FEE_QUERY", "Instalment plan request", "HIGH", "SUBMITTED"],
    ["OTHER", "Library clearance", "MEDIUM", "UNDER_REVIEW"], ["ENROLLMENT_VERIFICATION", "Internship verification letter", "MEDIUM", "SUBMITTED"],
  ];
  for (let i = 0; i < reqSpecs.length; i++) {
    const [c, subj, p, st] = reqSpecs[i];
    await mkReq(1 + ((i * 3) % (students.length - 1)), c, subj, `${subj}. (Fictional demo request.)`, p, st, st !== "SUBMITTED" || i % 2 === 0, between(1, 20));
  }

  // ---- notifications
  const n = (userId: string, type: Parameters<typeof db.notification.create>[0]["data"]["type"], title: string, body: string, link: string, ago: number, read = false) =>
    db.notification.create({ data: { userId, type, title, body, link, createdAt: daysAgo(ago), readAt: read ? daysAgo(ago) : null } });
  await n(demo.userId, "REQUEST_SUBMITTED", "Request submitted", `${r1.ticketNo} was submitted. Expected processing time: 5 working days.`, "/student/requests", 1);
  await n(demo.userId, "INFO_REQUIRED", "Additional information required", `Staff replied on ${r2.ticketNo}. Please upload your Class 10 certificate.`, "/student/requests", 4);
  await n(demo.userId, "DOCUMENT_REJECTED", "Document rejected", "Your Bank proof needs a clearer scan.", "/student/documents", 11);
  await n(demo.userId, "FEE_REMINDER", "Fee reminder", "The remaining balance for 2026-27 is due on 15 Nov 2026.", "/student/fees", 3);
  await n(demo.userId, "RESULT_PUBLISHED", "Result published", "Semester 4 results are now available.", "/student/results", 120, true);
  await n(demo.userId, "ANNOUNCEMENT", "University announcement (demo)", "This is a fictional announcement for demonstration purposes.", "/student/notifications", 8, true);
  await n(office.id, "REQUEST_SUBMITTED", "New request awaiting assignment", `${r1.ticketNo} was submitted by a student.`, "/staff/requests", 1);
  await n(office.id, "ANNOUNCEMENT", "Demo data loaded", "All records in this system are fictional.", "/staff", 1, true);

  // ---- audit history (fictional administrative activity)
  const events: [string, string, string, string, number][] = [
    ["REQUEST_ASSIGNED", "StudentRequest", r2.id, `Assigned ${r2.ticketNo} to Ritu Kapoor`, 5],
    ["REQUEST_STATUS_CHANGED", "StudentRequest", r3.id, `${r3.ticketNo} marked Resolved`, 12],
    ["DOCUMENT_REJECTED", "Document", dBank.id, "Document rejected: Bank proof", 11],
    ["DOCUMENT_VERIFIED", "Document", dMark.id, "Document verified: Previous-year marksheet", 28],
    ["PAYMENT_VERIFIED", "FeePayment", "demo", "Payment verified (demo record)", 45],
    ["SEED_COMPLETED", "System", "seed", "Fictional demo data loaded", 0],
  ];
  for (const [action, entityType, entityId, summary, ago] of events) {
    await db.auditLog.create({ data: { actorId: office.id, action, entityType, entityId, summary, createdAt: daysAgo(ago) } });
  }

  console.log(`Seeded: ${students.length} students, ${staffSpecs.length} staff, ${ticketN} requests, ${payN} payments.`);
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
