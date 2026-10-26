<div align="center">

# 🎓 Student Office Management System

### A Centralized Portal for Student Services and University Administration

<p>
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/Project-Academic-orange" alt="Academic Project">
</p>

**Simplifying student services through a modern, role-based web application.**

</div>

---

## 📌 About the Project

The **Student Office Management System (SOMS)** is a web-based application designed to streamline student services and university administrative operations through a centralized digital platform.

The system provides separate interfaces for students and administrative staff, enabling users to access relevant information according to their roles and permissions.

Built using modern web technologies, this project establishes the foundation for digitizing academic administration, improving accessibility, and reducing dependence on manual processes.

> **Project Status:** Prototype in active development. Some modules are implemented, while others remain planned or partially implemented.

## 🎯 Objectives

- Centralize student information and administrative services.
- Provide secure authentication and role-based access control.
- Simplify access to student profiles and notifications.
- Establish a foundation for digital fee, examination, and document workflows.
- Improve the accessibility and organization of university services.
- Build a scalable foundation for future academic management features.

## ✨ Key Features

### 👨‍🎓 Student Portal
- Student login and authentication.
- Personalized student dashboard.
- Student profile and information views.
- Notifications and help section.
- Role-restricted access to student services.

### 🏢 Administrative Staff Portal
- Dedicated staff dashboard.
- Role-based access permissions.
- Student search functionality.
- Separate administrative roles for Student Office, Finance, Examination, and Academic departments.
- Access-controlled administrative interfaces.

### 🔐 Authentication and Security
- Password hashing.
- Server-side session management.
- HTTP-only session cookies.
- Role-based authorization checks.
- Input validation and login rate limiting.
- Audit-event support and security headers.

### 🗄️ Database and Backend
- Prisma ORM for database management.
- SQLite for local development.
- Structured database models and relationships.
- Demo data seeding for testing.
- API routes and server-side application logic.

### 📸 Screenshots

### Landing Page

![SOMS Landing Page](screenshots/landing-page.png)

### Student Dashboard

![Student Dashboard](screenshots/student-dashboard.png)

### Administrative Staff Dashboard

![Staff Dashboard](screenshots/staff-dashboard.png)

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack React framework |
| React | User interface development |
| TypeScript | Type-safe application development |
| Tailwind CSS | Styling and responsive UI |
| Prisma ORM | Database access and schema management |
| SQLite | Local development database |
| Zod | Input validation |
| bcryptjs | Password hashing |
| Lucide React | Icons |

## 👥 User Roles

The system is designed around different user roles with separate access permissions.

| Role | Primary Responsibility |
|---|---|
| Student | Access personal information, dashboard, and notifications |
| Student Office | Student administration and service workflows |
| Finance | Fee-related administrative operations |
| Examination | Examination and result-related operations |
| Academic | Academic information and related workflows |

Access to individual features depends on the permissions implemented for each role.

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

npm is included with Node.js.

### 1. Clone the Repository

Replace `YOUR-USERNAME` with your GitHub username.

```bash
git clone https://github.com/Dhawalhatiya/student-office-management-system.git
```

Navigate to the project directory:

```bash
cd student-office-management-system
```

If the application is inside a subfolder, navigate into that folder before continuing.

**Run all subsequent commands from the directory containing `package.json`.**

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a local `.env` file from the example configuration.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Review the environment configuration and use the appropriate local development settings.

Do not upload `.env` or any file containing actual secrets to GitHub.

### 4. Set Up the Database

Run the following command to apply the Prisma schema:

```bash
npm run db:push
```

This prepares the database structure for the application.

### 5. Insert Demo Data

```bash
npm run db:seed
```

This command inserts fictional sample data for local testing.

**Warning:** The seed script clears existing application records before inserting demo data. Do not run it against a database containing information you need to preserve.

### 6. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:

**http://localhost:3000**

The application should now be accessible locally.

Keep the terminal running while using the application. Press `Ctrl + C` to stop the development server.

## 🔑 Demo Login Credentials

The following credentials are intended for local demonstration with the seeded database.

| User Role | Email | Password |
|---|---|---|
| Student | `student.demo@example.com` | `DemoStudent123!` |
| Student Office | `staff.demo@example.com` | `DemoStaff123!` |
| Finance | `finance.demo@example.com` | `DemoStaff123!` |
| Examination | `exam.demo@example.com` | `DemoStaff123!` |
| Academic | `academic.demo@example.com` | `DemoStaff123!` |

**Security Notice:** These are demonstration credentials, not production credentials. Do not use them for a real deployment.

## 📂 Project Structure

```text
student-office-management-system/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── login/
│   │   ├── student/
│   │   ├── staff/
│   │   ├── actions.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   └── middleware.ts
├── tests/
├── docs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

*The exact structure may vary depending on the current version of the project.*

## 📊 Implementation Status

| Module | Status |
|---|---|
| Landing Page | Implemented |
| Login and Authentication | Implemented |
| Session Management | Implemented |
| Student Dashboard | Implemented |
| Student Profile | Implemented |
| Notifications | Implemented |
| Staff Dashboard | Implemented |
| Role-Based Access Control | Implemented |
| Student Search | Implemented |
| Fee Management | Planned / Placeholder |
| Result Management | Planned / Placeholder |
| Document Management | Planned / Placeholder |
| Scholarship Management | Planned / Placeholder |
| Student Request Workflows | Planned / Placeholder |
| Reports and Exports | Planned / Placeholder |
| AI Data Assistant | Planned / Placeholder |

The project is under development. Planned features may not yet be available for practical use.

## 💻 Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm start` | Start the built application |
| `npm run db:push` | Apply the database schema |
| `npm run db:seed` | Insert demo data |
| `npm run db:reset` | Reset and reseed the database |
| `npm test` | Run the test suite |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test:http` | Run HTTP tests against a running server |

**Caution:** `npm run db:reset` is destructive and can erase existing database records.

## 🔒 Security Considerations

The project includes foundational security mechanisms, such as password hashing, server-side sessions, permission checks, input validation, and login rate limiting.

Before using the system in a real university environment, additional work is required, including:

- Production-grade environment configuration.
- HTTPS and secure deployment settings.
- Comprehensive security testing.
- Database backup and recovery procedures. 
- Appropriate privacy and data-retention policies.
- Protection of confidential student and financial information.
- Review of authorisation rules and audit logging.

The current prototype should use fictional data only.

## 🗺️ Future Enhancements

The following features are potential areas for future development:

- Complete student record management.
- Online fee tracking and payment verification.
- Examination result management and publication.
- Digital document submission and verification.
- Scholarship application and administration.
- Student requests and complaint tracking.
- Administrative reports and data exports.
- Email and in-app notifications.
- AI-assisted data analysis and administrative insights.
- Improved mobile responsiveness and accessibility.

These enhancements represent future development goals rather than completed functionality.

## 🤝 Contributing

Contributions, suggestions, and constructive feedback are welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the updated functionality.
5. Submit a pull request describing your changes.

Please avoid committing credentials, environment files, local databases, or personal information.

## 📄 License

No license has been specified for this project yet. Unless a license is added, the default copyright rules apply and reuse or redistribution is not automatically permitted.

---

<div align="center">

**Student Office Management System**

* Digitising Student Services. Simplifying Administration.*

Developed as an academic software project.

</div>
