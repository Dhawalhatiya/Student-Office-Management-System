# Student Office Management System

Avantika University academic project. **Demo application: all data is fictional.**

Status: **Phase 1 (foundation) and Phase 2 (authentication and permissions) are complete.**
Phases 3-8 are not built yet; their pages say so on screen.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Prisma 6 (driver adapters) · SQLite for local development, PostgreSQL for production · Zod · bcryptjs · Lucide icons.
shadcn/ui, ExcelJS and PDFKit are not added yet; they arrive with the phases that need them.

## Setup

```bash
npm install
cp .env.example .env
npm run db:push      # creates the tables from prisma/schema.prisma
npm run db:seed      # loads fictional demo data (wipes existing rows)
npm run dev          # http://localhost:3000
```

Tests:

```bash
npm test                                   # unit tests, no server needed
npm run build && npm start                 # then, in another terminal:
BASE_URL=http://localhost:3000 npm run test:http   # 32 role-boundary and login tests
```

## Demo accounts (development / DEMO_MODE only)

| Account | Email | Password |
|---|---|---|
| Student (Aarav Mehta, AVU-DEMO-24-CSE-001) | student.demo@example.com | DemoStudent123! |
| Staff - Student Office | staff.demo@example.com | DemoStaff123! |
| Staff - Finance | finance.demo@example.com | DemoStaff123! |
| Staff - Examination | exam.demo@example.com | DemoStaff123! |
| Staff - Academic | academic.demo@example.com | DemoStaff123! |

Other seeded students use `studentNN.demo@example.com` with the student password.
These are not production credentials. The login page only shows them when `DEMO_MODE` is true (default outside production).

## Roles and permissions

Two roles: **Student** and **Administrative Staff**. There is no Super Admin.
Staff are split into four groups with least-privilege permissions (see `src/lib/permissions.ts`):

| Permission | Student Office | Finance | Examination | Academic |
|---|---|---|---|---|
| students.read | yes | yes | yes | yes |
| students.write | yes | | | |
| fees.read | yes | yes | | |
| fees.write (record/verify payments, receipts) | | yes | | |
| results.read | yes | | yes | yes |
| results.write / results.publish | | | yes | |
| requests.read | yes | yes | yes | yes |
| requests.manage | yes | | | |
| documents.review | yes | | | |
| scholarships.read | yes | | | yes |
| scholarships.manage | yes | | | |
| reports.export | yes | yes | yes | yes |
| ai.assistant | yes | yes | | |

The role is read from the database through an opaque server-side session; the portal card chosen on the landing page grants nothing.

## What Phases 1-2 include

- Landing page, login, logout, session management (hashed tokens, httpOnly cookies, 8 h expiry).
- Full Prisma schema (24 models) for every later phase, with unique, foreign-key and index constraints.
- Fictional seed data: 37 students, 4 staff, fees and payments (including pending payments that do not count), results in all four lifecycle states, requests with threads, documents, scholarships, notifications, audit entries.
- Student portal: dashboard (database-backed), profile, notifications, help. Other student pages are labelled placeholders.
- Staff portal: dashboard (metrics hidden when the staff group lacks the permission), student search by enrollment number or name, settings (shows your permissions), access-denied page. Other staff pages are labelled placeholders.
- API routes `/api/me`, `/api/student/dashboard`, `/api/staff/dashboard` with 401/403 handling.

## Security notes

- Authorization is enforced on the server in `src/lib/auth.ts` (pages and APIs). `src/middleware.ts` is only an optimistic redirect for visitors with no cookie.
- Every student query is scoped by the student id from the session. Student result queries filter `status = PUBLISHED`.
- Login: Zod validation, one generic error for wrong password or unknown email, constant-time-ish comparison, rate limit of 5 attempts per IP+email and 30 per IP per 15 minutes, audit events for success, failure, logout and denied access.
- Open-redirect protection on the `next` parameter; security headers in `next.config.mjs`.
- The rate limiter is in memory (single process). Use a shared store for multi-instance deployments.
- `x-forwarded-for` is trusted for IP logging; only deploy behind a proxy you control.
- Seeding refuses to run when `NODE_ENV=production` unless `ALLOW_DEMO_SEED=true`.

## PostgreSQL / deployment notes

1. In `prisma/schema.prisma` change `provider = "sqlite"` to `"postgresql"`.
2. Set `DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/som?schema=public"` (`src/lib/db.ts` picks the adapter from the URL).
3. `npx prisma migrate dev --name init` locally, then `npx prisma migrate deploy` on the server.
4. Serve over HTTPS, set `NODE_ENV=production`, keep `DEMO_MODE` unset unless you are deliberately demoing.

## Backup and recovery

- PostgreSQL: schedule `pg_dump` nightly (and enable point-in-time recovery if your host supports it); test a restore monthly with `pg_restore` into a scratch database.
- SQLite (local only): stop the app and copy `prisma/dev.db`; or use `sqlite3 prisma/dev.db ".backup backup.db"`.
- Private document storage (Phase 4) must be backed up together with the database so file keys and rows stay consistent.
- Academic and financial history is never hard-deleted by the application (relations use `Restrict`).

## Known limitations

- Name search on SQLite is case-insensitive for ASCII only; PostgreSQL uses `mode: "insensitive"`.
- Not yet built: student detail tabs and record editing (Phase 3), fees/receipts/results/documents/scholarships (Phase 4), request workflow (Phase 5), reports and exports (Phase 6), AI Data Assistant (Phase 7).
