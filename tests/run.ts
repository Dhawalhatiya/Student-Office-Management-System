/** Fast unit tests (no server needed). Run: npm test */
import assert from "node:assert/strict";
import { can, STAFF_PERMISSIONS } from "../src/lib/permissions";
import { rateLimit, _clearAllRateLimits } from "../src/lib/rate-limit";
import { formatINR, titleCase } from "../src/lib/format";

let n = 0;
function t(name: string, fn: () => void) { fn(); n++; console.log("PASS ", name); }

t("no Super Admin: only four staff groups exist", () => {
  assert.deepEqual(Object.keys(STAFF_PERMISSIONS).sort(), ["ACADEMIC", "EXAMINATION", "FINANCE", "STUDENT_OFFICE"]);
});
t("finance can write fees but cannot publish results", () => {
  assert.ok(can("FINANCE", "fees.write"));
  assert.ok(!can("FINANCE", "results.publish"));
});
t("examination can publish results but cannot write fees", () => {
  assert.ok(can("EXAMINATION", "results.publish"));
  assert.ok(!can("EXAMINATION", "fees.write"));
});
t("student office cannot publish results or record payments", () => {
  assert.ok(!can("STUDENT_OFFICE", "results.publish"));
  assert.ok(!can("STUDENT_OFFICE", "fees.write"));
});
t("missing staff role has no permissions", () => {
  assert.ok(!can(null, "students.read"));
});
t("rate limiter blocks after the limit and recovers after the window", () => {
  _clearAllRateLimits();
  for (let i = 0; i < 3; i++) assert.ok(rateLimit("k", 3, 1000, 0).allowed);
  assert.ok(!rateLimit("k", 3, 1000, 10).allowed);
  assert.ok(rateLimit("k", 3, 1000, 1500).allowed);
});
t("formatting helpers", () => {
  assert.equal(formatINR(145000).replace(/\s/g, ""), "₹1,45,000");
  assert.equal(titleCase("WAITING_FOR_STUDENT"), "Waiting For Student");
});
console.log(`\n${n} tests passed`);
