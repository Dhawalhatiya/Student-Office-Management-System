/**
 * End-to-end role-boundary tests against a running server.
 * Usage: BASE_URL=http://localhost:3000 npm run test:http   (database must be seeded)
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  " + extra}`);
  ok ? pass++ : fail++;
}

async function login(email: string, password: string, portal = "student") {
  const page = await (await fetch(`${BASE}/login?portal=${portal}`)).text();
  const fd = new FormData();
  // Progressive-enhancement form: copy the hidden server-action fields exactly as a browser would.
  const hidden = [...page.matchAll(/<input type="hidden" name="(\$ACTION[^"]*)"(?: value="([^"]*)")?/g)];
  if (!hidden.length) throw new Error("login action fields not found");
  for (const [, name, value] of hidden) fd.set(name, (value ?? "").replace(/&quot;/g, '"'));
  fd.set("email", email); fd.set("password", password); fd.set("portal", portal);
  const res = await fetch(`${BASE}/login?portal=${portal}`, { method: "POST", body: fd, redirect: "manual" });
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith("som_session="))?.split(";")[0];
  return { res, cookie, body: await res.text() };
}
const get = (path: string, cookie?: string) => fetch(`${BASE}${path}`, { redirect: "manual", headers: cookie ? { cookie } : {} });

async function main() {
  // anonymous
  for (const p of ["/student", "/staff", "/student/profile", "/staff/students"]) {
    const r = await get(p);
    check(`anonymous ${p} redirects to login`, r.status === 307 && (r.headers.get("location") ?? "").includes("/login"), String(r.status));
  }
  for (const p of ["/api/me", "/api/staff/dashboard", "/api/student/dashboard"]) {
    check(`anonymous ${p} -> 401`, (await get(p)).status === 401);
  }
  check("forged session cookie is rejected", (await get("/student", "som_session=not-a-real-token")).status === 307);

  // bad logins give one generic message
  const bad1 = await login("student.demo@example.com", "wrong-password-1!");
  const bad2 = await login("nobody@example.com", "whatever123!");
  check("wrong password shows generic error", bad1.body.includes("Email or password is incorrect") && !bad1.cookie);
  check("unknown email shows the same generic error", bad2.body.includes("Email or password is incorrect") && !bad2.cookie);
  const bad3 = await login("not-an-email", "x");
  check("invalid email is validated", bad3.body.includes("Enter a valid email address"));

  // student
  const stu = await login("student.demo@example.com", "DemoStudent123!");
  check("student login redirects to /student with session cookie", stu.res.status === 303 && !!stu.cookie && (stu.res.headers.get("location") ?? "").endsWith("/student"), `${stu.res.status} ${stu.res.headers.get("location")}`);
  const c = stu.cookie!;
  const dash = await (await get("/student", c)).text();
  check("student dashboard shows own name and enrollment number", dash.includes("Aarav") && dash.includes("AVU-DEMO-24-CSE-001"));
  check("student dashboard shows DB-backed fee balance", dash.includes("₹72,500"), "expected balance 72,500");
  const prof = await (await get("/student/profile", c)).text();
  check("student profile shows own record only", prof.includes("AVU-DEMO-24-CSE-001") && !prof.includes("AVU-DEMO-23-CSE"));
  const sApi = await (await get("/api/student/dashboard", c)).json();
  check("student API returns latest PUBLISHED result (semester 4, not the semester 5 draft)", sApi.latestResult?.semester === 4, JSON.stringify(sApi.latestResult));
  const rs = await get("/staff", c);
  check("student cannot open /staff (redirected to /student)", rs.status === 307 && (rs.headers.get("location") ?? "").endsWith("/student"));
  check("student cannot open /staff/students", (await get("/staff/students?q=AVU", c)).status === 307);
  check("student API call to staff dashboard -> 403", (await get("/api/staff/dashboard", c)).status === 403);
  check("/api/me reports STUDENT role from server", (await (await get("/api/me", c)).json()).role === "STUDENT");

  // staff (signing in through the STUDENT portal card must not change the role)
  const off = await login("staff.demo@example.com", "DemoStaff123!", "student");
  check("staff account signing in via student portal lands in staff portal", (off.res.headers.get("location") ?? "").endsWith("/staff"), String(off.res.headers.get("location")));
  const oc = off.cookie!;
  const sdash = await (await get("/staff", oc)).text();
  check("staff dashboard shows metrics", sdash.includes("Total students") && sdash.includes("37"));
  check("staff cannot open student portal", (await get("/student", oc)).status === 307);
  check("staff API to student dashboard -> 403", (await get("/api/student/dashboard", oc)).status === 403);
  const search = await (await get("/staff/students?q=AVU-DEMO-24-CSE-001", oc)).text();
  check("staff finds student by exact enrollment number", search.includes("Aarav Mehta"));
  const inj = await get("/staff/students?q=" + encodeURIComponent("' OR 1=1 --"), oc);
  check("SQL-looking search text is handled safely (no results, no error)", inj.status === 200 && (await inj.text()).includes("No students match"));
  check("Student Office staff can open Fees (fees.read)", (await get("/staff/fees", oc)).status === 200);

  // least privilege between staff groups
  const fin = await login("finance.demo@example.com", "DemoStaff123!", "staff");
  const exam = await login("exam.demo@example.com", "DemoStaff123!", "staff");
  const r1 = await get("/staff/results", fin.cookie!);
  check("Finance staff denied Results (redirect to access-denied)", r1.status === 307 && (r1.headers.get("location") ?? "").includes("access-denied"), String(r1.headers.get("location")));
  const r2 = await get("/staff/fees", exam.cookie!);
  check("Examination staff denied Fees", r2.status === 307 && (r2.headers.get("location") ?? "").includes("access-denied"));
  const fdash = await (await get("/staff", fin.cookie!)).text();
  check("Finance dashboard hides request/document metrics", !fdash.includes("Documents awaiting review") && fdash.includes("Paid fee accounts"));
  const fApi = await (await get("/api/staff/dashboard", fin.cookie!)).json();
  check("Finance API returns null for sections outside its permissions", fApi.documentsAwaitingReview === null && fApi.fees !== null);

  // rate limiting
  let blocked = false;
  for (let i = 0; i < 7; i++) {
    const r = await login("rate.limit.test@example.com", "wrong-password!" + i);
    if (r.body.includes("Too many sign-in attempts")) blocked = true;
  }
  check("repeated failed logins are rate limited", blocked);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
