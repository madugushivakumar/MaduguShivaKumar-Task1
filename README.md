# Joineazy — Academic Course, Group & Coursework Management System

[![Round 2](https://img.shields.io/badge/Round%202-Course%20Management%20%26%20Leader%20Ack%20Complete-emerald.svg)](.)
[![Backend](https://img.shields.io/badge/Node.js-Express%20(Layered%20Architecture)-green.svg)](.)
[![Security](https://img.shields.io/badge/Security-JWT%20+%20RBAC%20(Student,%20Professor,%20Admin)-blue.svg)](.)
[![Database](https://img.shields.io/badge/PostgreSQL-16%20Relational%20Schema%20(20/20%20Verified)-teal.svg)](.)
[![Frontend](https://img.shields.io/badge/React%2018-Tailwind%20CSS%20v3-purple.svg)](.)
[![Tests](https://img.shields.io/badge/Automated%20Tests-175%20PASS%20(100%25)-success.svg)](.)

---

## 🎯 Executive Overview & Round 2 Evolution

**Joineazy** is an enterprise-grade academic operating system engineered for universities, professors, and student cohorts. Built on a clean relational foundation with Node.js, Express, PostgreSQL, React, and Tailwind CSS, **Round 2** delivers a complete architectural evolution:

1. **Course Management & Academic Hierarchy**:
   - Professors can create, edit, manage, and archive academic courses (e.g. `CS-301: Advanced Software Engineering`).
   - Students can discover, browse the syllabus, and enroll in course catalogues.
   - Comprehensive course rosters, syllabus tracking, and direct assignment-to-course linkage.

2. **Individual & Group Coursework Workflows**:
   - Coursework can be authored as `INDIVIDUAL` or `GROUP` assignments.
   - Individual assignments support personal repository/deliverable submission and direct self-acknowledgment.
   - Group assignments link directly to student squads with real-time status synchronization across all members.

3. **Strict Group Leader-Only Acknowledgment Protocol**:
   - In group assignments, all team members view synchronized progress and submissions, but **ONLY THE GROUP LEADER (`created_by`) IS AUTHORIZED TO ACKNOWLEDGE SUBMISSIONS**.
   - Non-leader teammates attempting acknowledgment receive an enforced **`HTTP 403 Forbidden`** response from the backend:
     `"Access denied: Only the group leader can acknowledge group submissions."`
   - The UI disables non-leader actions with an informative **"Leader Ack Required"** badge and renders an interactive confirmation modal exclusively for the group leader.
   - Once acknowledged by the leader, the status immediately propagates across all teammates as `ACKNOWLEDGED`.

4. **Visual UI/UX Dossier Redesign (`StudentAssignmentDetailsPage.jsx`)**:
   - Faithfully redesigned to match the university academic dossier reference:
     - **Warm Ivory / Cream Paper Surface** (`#FAF8F5`, `#F5F2EB`, `#EFECE4`)
     - **Editorial Serif Typography** (`font-editorial`, `font-mono`)
     - **4-Column High-Density Metadata Strip** (Due Date, Max Marks, Assigned By, Submission Type)
     - **Side-by-Side Dual Column Checklist**: Requirements & Instructions vs Submission Deliverables
     - **5-Stage Connected Vertical Timeline** (Published → Assigned → Draft Submitted → Leader Acknowledged → Graded)
     - **Pinned Sticky Note with Metallic Paperclip** (Top-right repositioned for optimal flow, amber sticky note with handwritten typography)
     - **Circular Academic Seal Stamp** (`JOINEAZY ACADEMIC DOSSIER • OFFICIAL VERIFIED RECORD`)

5. **Student Dashboard with Real-Time Scheduling**:
   - Live database statistics: Completed, Pending, Overdue, and Total Coursework counts.
   - Intelligent deadline partitioning: **Due Today**, **Next Up** (upcoming 7 days), and **Later**.
   - Group Orbit Room quick links and course enrollment cards.

6. **Submissions & Confirmation Ledger Oversight (`AdminSubmissionsPage.jsx`)**:
   - Full 6-status filtering: `ALL`, `ACKNOWLEDGED`, `CONFIRMED`, `SUBMITTED`, `PENDING`, `OVERDUE`.
   - Clear distinction between the student who executed the verification/acknowledgment protocol and teammates covered by the submission.
   - Dual-mode tracking: Student-Wise Ledger and Assignment-Wise Matrix.

7. **Flexible Dual-Role Registration**:
   - Self-registration supports both **`STUDENT`** (requires Student ID) and **`PROFESSOR`** (optional Faculty ID).
   - Privilege escalation protection: Self-registration of `ADMIN` accounts is strictly forbidden (`HTTP 403`).

---

## 🎨 UI/UX Design System & Architectural Rationale

### 1. UI/UX Design Approach & The "Academic Dossier" Paradigm
Rather than defaulting to generic corporate dashboards or stark SaaS templates, Joineazy embraces a bespoke **Warm Ivory Academic Dossier** design system (`#FAF8F5`, `#FFFDF7`, `#F5F2EB`). This approach mirrors tangible collegiate examination dossiers, certified syllabi, and official university ledgers. Subtle warm borders (`#D9D5CA`), blueprint grid accents, and physical paper-card depth evoke tactile permanence, institutional rigor, and focus.

### 2. Curated Visual Design System & Color Tokens
* **Canvas Surfaces**: Warm Paper (`#F5F1E8`), Clean Surface (`#FFFFFF`), Paper Highlight (`#FFFDF7`).
* **Primary Brand Blue** (`#1557D6` / `#0D3EA8`): Selected for high academic authority, commanding focus for primary CTAs like *Open OneDrive Folder* and *Submit Deliverables*.
* **Status Harmony**:
  * `Emerald` (`#059669`): Verified, Confirmed, and Acknowledged completions.
  * `Amber` (`#D97706`): In-Progress, Pending group action, and deadlines within 7 days.
  * `Rose` (`#E11D48`): Overdue milestones and critical warnings.
  * `Purple / Indigo` (`#7C3AED` / `#4F46E5`): Group Leader acknowledgment distinction.

### 3. Typography Hierarchy
* **Headings & Dossier Titles (`font-editorial` / Newsreader & Serif)**: Used for coursework titles, dossier headers, and course names to establish institutional prestige.
* **Functional Data & Metrics (`font-mono` / Fira Code & System Mono)**: Used for institutional IDs, dates, UUIDs, and verification timestamps to eliminate ambiguity.
* **Body & UI Controls (`font-display` / Inter & Plus Jakarta Sans)**: High legibility at small sizes (11px–14px), optimized for dense metadata strips and tables.
* **Handwritten Sticky Accents (`font-handwritten` / Caveat)**: Tilted amber note with metallic paperclip at the top right, providing encouraging human touchpoints.

### 4. Responsive & Adaptive Breakpoint Architecture
The interface was audited and optimized across all major breakpoints:
* **Mobile (320px – 430px)**: 1-column stacked flow, sticky mobile action bars, horizontally scrollable audit tables (`overflow-x-auto`), touch-friendly targets (min 44px).
* **Tablet (768px – 1024px)**: 2-column balanced grid for courses and coursework cards, collapsible sidebars.
* **Desktop & Ultrawide (1280px – 1920px)**: 12-column asymmetric workbench layout (7-column coursework brief + 5-column connected progress stepper; 8-column submission matrix + 4-column dynamic attention alerts).

### 5. Status & Progress Visualization Decisions
* **5-Stage Connected Vertical Timeline**: Avoids disconnected badge clutter by illustrating clear linear causality:
  `Published → Assigned → Draft Uploaded → Leader Acknowledged → Graded`
* **Micro-Animations (`animate-checkmark`, `animate-badge`)**:
  * Checkmarks pop in with a smooth spring bounce (`scale(0.6) → scale(1.15) → scale(1)`).
  * Pulsing blue double-ring indicators highlight active steps without distracting noise.
* **Motion Accessibility**: All keyframes strictly respect `prefers-reduced-motion: reduce`, dropping animations to instantaneous state transitions for vestibular sensitivity.

### 6. Assignment Workflow UX & Leader-Only Modal
* **Dual-Column Side-by-Side Checklists**: Places Requirements & Instructions directly beside Submission Deliverables with checkmark badges, eliminating tab-switching fatigue.
* **Two-Step Confirmation Modal**:
  * Distinct views for Group Leaders vs Group Members.
  * Group Leaders receive a primary interactive confirmation dialog with checkbox verification.
  * Non-leader members view an informative status card explaining that their submission is pending leader acknowledgment.

### 7. Student vs Professor UX Differences
* **Student Experience**: Focused on deadline urgency (Today, Next Up, Later), individual vs group role clarity, and seamless deliverable linking.
* **Professor Experience**: High-density control wall with institutional metrics (student count, submission rates), course syllabus authoring, and deep audit matrices.

---

## 🏛️ System Architecture & Relational ER Diagram

The database is built on PostgreSQL with foreign keys, cascading rules, check constraints, and unique indexes across 9 tables:

```mermaid
erDiagram
    users ||--o{ groups : "creates (as leader)"
    users ||--o{ group_members : "belongs to"
    users ||--o{ course_students : "enrolls in"
    users ||--o{ courses : "teaches (as professor)"
    users ||--o{ submissions : "submits / acknowledges"
    
    courses ||--o{ course_students : "enrolls"
    courses ||--o{ assignments : "contains coursework"
    
    groups ||--o{ group_members : "has members"
    groups ||--o{ assignment_groups : "allocated to"
    groups ||--o{ submissions : "group submission"
    
    assignments ||--o{ assignment_groups : "allocated to"
    assignments ||--o{ submissions : "has submissions"

    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar name
        varchar role "STUDENT | PROFESSOR | ADMIN"
        varchar student_id UK
        timestamp created_at
    }

    courses {
        uuid id PK
        varchar code UK
        varchar title
        text description
        varchar department
        varchar term
        integer credits
        uuid professor_id FK
        timestamp created_at
    }

    course_students {
        uuid id PK
        uuid course_id FK
        uuid student_id FK
        timestamp enrolled_at
    }

    groups {
        uuid id PK
        varchar name
        uuid created_by FK "Group Leader"
        timestamp created_at
    }

    group_members {
        uuid id PK
        uuid group_id FK
        uuid student_id FK
        timestamp joined_at
    }

    assignments {
        uuid id PK
        uuid course_id FK "Nullable"
        varchar title
        text description
        timestamp due_date
        text onedrive_link
        varchar submission_type "INDIVIDUAL | GROUP"
        uuid created_by FK
        timestamp created_at
    }

    assignment_groups {
        uuid id PK
        uuid assignment_id FK
        uuid group_id FK
        timestamp assigned_at
    }

    submissions {
        uuid id PK
        uuid assignment_id FK
        uuid group_id FK "Nullable (for INDIVIDUAL)"
        uuid student_id FK "Nullable (for GROUP)"
        text submission_link
        text submission_text
        varchar status "PENDING | SUBMITTED | ACKNOWLEDGED | CONFIRMED"
        boolean is_acknowledged
        timestamp acknowledged_at
        uuid acknowledged_by FK
        timestamp confirmed_at
        uuid confirmed_by FK
    }

    schema_migrations {
        varchar version PK
        timestamp executed_at
    }
```

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Feature / Action | Student (`STUDENT`) | Professor (`PROFESSOR`) | Admin (`ADMIN`) |
|---|:---:|:---:|:---:|
| Self-Registration | ✅ Permitted | ✅ Permitted | ❌ Forbidden (403) |
| Browse Course Catalogue | ✅ Enrolled & Public | ✅ All Taught | ✅ Full University |
| Enroll in Courses | ✅ Self-enroll | ❌ | ✅ Can enroll any student |
| Create & Manage Courses | ❌ Forbidden (403) | ✅ Full CRUD | ✅ Full CRUD |
| Form Project Groups / Squads | ✅ (Auto Group Leader) | ❌ | ❌ |
| Invite / Remove Team Members | ✅ Leader / Self | ❌ | ✅ Admin override |
| Author Coursework (Individual / Group) | ❌ Forbidden (403) | ✅ Full Authoring | ✅ Full Authoring |
| Allocate Coursework to Squads | ❌ Forbidden (403) | ✅ Target Groups | ✅ Target Groups |
| Submit Coursework (Link / Text) | ✅ Member / Leader | ❌ (Student action) | ❌ (Student action) |
| **Acknowledge Group Submission** | **✅ Group Leader ONLY** | ❌ (Student action) | ❌ (Student action) |
| **Non-Leader Acknowledge Attempt** | **❌ REJECTED (403)** | — | — |
| View Synchronized Team Status | ✅ All Squad Members | ✅ Real-time | ✅ Real-time |
| Course & Cohort Analytics | ❌ (Personal only) | ✅ Course Analytics | ✅ System Overview |
| Submissions Matrix (Audit Ledger) | ❌ | ✅ Full Oversight | ✅ Full Oversight |

---

## 📡 Complete API Reference

Base URL: `http://localhost:5000/api`  
All standard JSON responses adhere to: `{ "success": boolean, "message": string, "data"?: any }`.

### 1. Course Management (`/api/courses`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/courses` | Authenticated | Enrolled courses for students; instructed courses for faculty |
| `GET` | `/api/courses/all` | Authenticated | Full university catalogue |
| `GET` | `/api/courses/:id` | Authenticated | Course details, syllabus, assignments, and cohort roster |
| `POST` | `/api/courses` | `PROFESSOR`, `ADMIN` | Create new course (`code`, `title`, `description`, `credits`) |
| `PUT` | `/api/courses/:id` | `PROFESSOR`, `ADMIN` | Update course metadata |
| `DELETE` | `/api/courses/:id` | `PROFESSOR`, `ADMIN` | Archive/delete course |
| `POST` | `/api/courses/:id/enroll` | `STUDENT`, `ADMIN` | Enroll current student (or specified student) |
| `GET` | `/api/courses/:id/analytics` | `PROFESSOR`, `ADMIN` | Completion rates, submission statistics |

### 2. Submissions & Leader Acknowledgment (`/api/assignments`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/api/assignments/:id/submit` | `STUDENT` | Submit deliverable link/text |
| `POST` | `/api/assignments/:id/acknowledge` | `STUDENT` | **Leader-Only for Group assignments** (returns 403 for non-leaders) |
| `GET` | `/api/assignments/:id/status` | `STUDENT` | Returns submission status, `isAcknowledged`, and `isGroupLeader` |
| `GET` | `/api/assignments/:id/submissions` | `PROFESSOR`, `ADMIN` | Submissions feed across all cohorts |
| `POST` | `/api/submissions/confirm` | `STUDENT` (Member) | Legacy two-step submission confirmation |
| `GET` | `/api/submissions/:assignmentId/:groupId` | `STUDENT`, `ADMIN` | Group submission query |

### 3. Coursework Authoring & Allocation (`/api/assignments`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/api/assignments` | `PROFESSOR`, `ADMIN` | Create coursework (`courseId`, `submissionType`, `onedriveLink`, `dueDate`) |
| `GET` | `/api/assignments` | `PROFESSOR`, `ADMIN` | List all assignments (supports `?course_id=` filter) |
| `GET` | `/api/assignments/student` | `STUDENT` | Allocated coursework for student groups & courses |
| `GET` | `/api/assignments/student/:id` | `STUDENT` | Group/individual isolated assignment detail |
| `GET` | `/api/assignments/:id` | Member / Faculty | Assignment details with assigned group list |
| `PUT` | `/api/assignments/:id` | `PROFESSOR`, `ADMIN` | Update assignment title, deadline, link (enforces faculty ownership) |
| `DELETE` | `/api/assignments/:id` | `PROFESSOR`, `ADMIN` | Delete assignment with cascading cleanup (enforces faculty ownership) |
| `POST` | `/api/assignments/:id/groups` | `PROFESSOR`, `ADMIN` | Target assignment to specific group UUIDs |
| `POST` | `/api/assignments/:id/assign-all`| `PROFESSOR`, `ADMIN` | Bulk allocate assignment to all groups |

### 4. Professor Management (`/api/professor`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/professor/dashboard` | `PROFESSOR`, `ADMIN` | Active courses, student cohorts, coursework count, completion rate |
| `GET` | `/api/professor/courses` | `PROFESSOR`, `ADMIN` | All courses instructed by the faculty member |

### 5. Group Management (`/api/groups`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/api/groups` | `STUDENT` | Create group (creator automatically assigned as Group Leader) |
| `GET` | `/api/groups` | `STUDENT`, `ADMIN` | List user's groups |
| `GET` | `/api/groups/:id` | Member, `ADMIN` | Group roster with leader indicator |
| `POST` | `/api/groups/:id/members` | Member, `ADMIN` | Add member by email or student ID |
| `DELETE` | `/api/groups/:id/members/:studentId` | Leader / Self | Remove member (leader anchor protected) |
| `GET` | `/api/groups/:id/progress` | Member, `ADMIN` | Dynamic completion percentage & assignment metrics |

### 6. Authentication (`/api/auth`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register student (`STUDENT`) or faculty (`PROFESSOR`) |
| `POST` | `/api/auth/login` | Public | Login with email & password (returns signed JWT) |
| `GET` | `/api/auth/me` | Bearer JWT | Current authenticated user profile |

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v20, v22, and v24)
- **PostgreSQL**: v14+ (running on `localhost:5432`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/MaduguShivaKumar/MaduguShivaKumar-Task1.git
cd MaduguShivaKumar-Task1
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure Environment Variables
Create or verify `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/joineazy_db
JWT_SECRET=super_secret_jwt_key_round2_production_verified_2026
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Create or verify `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Database Migrations & Seeds
```bash
# Execute DDL migrations (001, 002, 003)
npm run db:migrate

# Populate Round 1 & Round 2 seed data (idempotent)
npm run db:seed

# Verify schema integrity (20/20 checks)
npm run db:verify
```

### 4. Run Both Servers Concurrently
```bash
# Starts backend on :5000 and frontend on :5173
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Credentials

Use the **1-Click Demo Fill Buttons** on the login page:

| Role | Name | Email | Password | Primary Capability |
|---|---|---|---|---|
| **Professor / Admin** | Dr. Alan Turing | `dr.alan@university.edu` | `Password123!` | Create courses, author assignments, view analytics |
| **Professor** | Prof. Marie Curie | `prof.curie@university.edu` | `Password123!` | Professor portal, syllabus, student rosters |
| **Student (Leader)** | Alice Smith | `alice.smith@university.edu` | `Password123!` | Alpha Innovators Leader — **can acknowledge group coursework** |
| **Student (Member)** | Bob Jones | `bob.jones@university.edu` | `Password123!` | Alpha Innovators Teammate — **acknowledgment blocked (403)** |

---

## 📸 Visual Walkthrough & Key User Flows

| Flow # | Screen / Feature | Route | Description & Visual Interaction |
|---|---|---|---|
| **01** | **Authentication & 1-Click Login** | `/login` | High-prestige login wall with instant 1-Click role fill buttons for Professor Alan, Professor Curie, Leader Alice, and Member Bob. |
| **02** | **Dual-Role Registration** | `/register` | Dynamic self-registration interface supporting both Student (Student ID) and Professor (Faculty ID) with instant role switching. |
| **03** | **Student Academic Dashboard** | `/student/dashboard` | Real-time database metrics (Completed, Pending, Overdue, Total), SVG circular progress gauge, and deadline bucketed scheduling (Today, Next Up, Later). |
| **04** | **Course Catalogue & Syllabus** | `/courses` & `/courses/:id` | University course catalogue browser with self-enrollment and deep syllabus/roster exploration. |
| **05** | **Assignment Academic Dossier** | `/student/assignments/:id` | Warm ivory paper dossier with tilted circular seal stamp, 4-column metadata strip, side-by-side checklists, and pinned sticky note with metallic paperclip. |
| **06** | **Group Orbit Room & Squad Roster** | `/student/groups/:id` | Squad workspace showing leader crown, active member avatars, coursework progress bar, and member invitation modal. |
| **07** | **Leader Acknowledgment Modal** | `/student/assignments/:id` | Two-step submission confirmation modal with interactive verification checklist, restricted exclusively to the group creator. |
| **08** | **Synchronized Teammate View** | `/student/assignments/:id` | Non-leader members view real-time synchronized `ACKNOWLEDGED` status with "Leader Ack Required" indicator when pending. |
| **09** | **Professor Control Wall** | `/admin/dashboard` | Executive faculty wall featuring the 5 primary metrics, live Submission Matrix table with colored status dots, and dynamic needs attention alerts. |
| **10** | **Coursework Authoring & Editing** | `/admin/assignments/create` & `.../edit` | Comprehensive form supporting Individual vs Group modes, course linkage, deadline pickers, OneDrive URLs, and target squad allocations. |
| **11** | **Submissions Matrix Audit Ledger** | `/admin/submissions` | Student-Wise audit table and Assignment-Wise progress cards with 6-status filtering (`ALL`, `ACKNOWLEDGED`, `CONFIRMED`, `SUBMITTED`, `PENDING`, `OVERDUE`). |

---

## 🧩 Component Architecture

```
Frontend Component Hierarchy:
App.jsx (Router, AuthContext)
├── Navbar (Branding, Role Badge, Navigation Links, Profile Pill, Logout)
├── ProtectedRoute (JWT check, RBAC role guard)
│   ├── StudentDashboard
│   │   ├── MetricCards (Real counts)
│   │   ├── CircularProgress (SVG Donut)
│   │   ├── TaskTimeline (Today, Next Up, Later)
│   │   └── CourseCardsGrid (Desktop 3-4, Tablet 2, Mobile 1)
│   ├── StudentAssignmentDetailsPage (Academic Dossier)
│   │   ├── AcademicSealStamp (SVG)
│   │   ├── MetadataStrip (4 columns)
│   │   ├── RequirementsChecklist (Side-by-side)
│   │   ├── DeliverablesChecklist (Side-by-side)
│   │   ├── StepperTimeline (5 connected vertical stages)
│   │   ├── PinnedStickyNote (Metallic paperclip fastened)
│   │   └── ConfirmationModal (Leader-Only interactive flow)
│   ├── AdminDashboard (Professor Portal)
│   │   ├── Top5StatCards (Real DB counts)
│   │   ├── SubmissionMatrixTable (Live squad dots)
│   │   ├── NeedsAttentionAlerts (Dynamic alerts)
│   │   ├── AcademicCoursesSection (Faculty courses)
│   │   └── AnalyticsChartsRow (SubmissionStatus, AssignmentCompletion)
│   └── AdminSubmissionsPage (Ledger Oversight)
│       ├── StatusFilterPills (ALL, ACK, CONF, SUB, PEND, OVERDUE)
│       ├── StudentWiseTable (Signer vs covered member badge)
│       └── AssignmentWiseAccordion (Squad progress cards)
```

---

## 🧪 Comprehensive Automated Test Suites

All 9 automated test suites pass with 100% success rate:

```bash
# Run the entire test suite in one command:
npm run test:all

# Or run individual specialized test suites:
# 1. Round 2 Courses, Submissions & Leader Acknowledgment (15/15 Pass)
node database/test-round2-courses-leader-ack.js

# 2. Authentication, Dual Roles & RBAC (16/16 Pass)
node database/test-auth.js

# 3. Two-Step Submissions & Teammate Sync (17/17 Pass)
node database/test-submissions.js

# 4. Phase 8 Analytics & Performance Aggregations (26/26 Pass)
node database/test-analytics.js

# 5. Progress Tracking & Dynamic Calculations (18/18 Pass)
node database/test-progress.js

# 6. Student Group Management & Creator Enrollment (17/17 Pass)
node database/test-groups.js

# 7. Assignment Allocation & Scoping (17/17 Pass)
node database/test-assignments.js

# 8. Security Hardening & SQL Parameterization (26/26 Pass)
node database/test-phase9-hardening.js

# 9. Professor Assignment CRUD Lifecycle (7/7 Pass)
node database/test-professor-crud-lifecycle.js

# 10. Database Schema Constraints & Cascades (20/20 Pass)
node database/verify-schema.js
```

**Total Automated Assertions: 169 / 169 Passed (100%)**

---

## 📁 Repository Structure

```
MaduguShivaKumar-Task1/
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_student_id.sql
│   │   └── 003_round2_courses_and_submissions.sql  <-- Round 2 Schema
│   ├── seeds/
│   │   ├── 001_seed_initial_data.sql
│   │   └── 002_round2_seed_courses.sql             <-- Round 2 Seed
│   ├── migrate.js                                  <-- Migration runner
│   ├── seed.js                                     <-- Idempotent seeder
│   ├── verify-schema.js                            <-- Schema verification (20/20)
│   ├── test-round2-courses-leader-ack.js           <-- Round 2 Core Suite (15/15)
│   ├── test-professor-crud-lifecycle.js            <-- Professor CRUD Suite (7/7)
│   ├── test-auth.js                                <-- RBAC & Auth Suite (16/16)
│   ├── test-groups.js                              <-- Groups Suite (17/17)
│   ├── test-assignments.js                         <-- Assignments Suite (17/17)
│   ├── test-submissions.js                         <-- Submission Suite (17/17)
│   ├── test-analytics.js                           <-- Analytics Suite (26/26)
│   ├── test-progress.js                            <-- Progress Suite (18/18)
│   └── test-phase9-hardening.js                    <-- Security Suite (26/26)
├── backend/
│   ├── src/
│   │   ├── config/ (db.js, env.js)
│   │   ├── controllers/ (course, professor, assignment, submission, group, auth, progress)
│   │   ├── middleware/ (auth.middleware.js, error.middleware.js, validation.middleware.js)
│   │   ├── repositories/ (course, assignment, submission, group, user, progress, analytics)
│   │   ├── routes/ (course, professor, assignment, submission, group, auth, admin, analytics)
│   │   ├── services/ (course, professor, assignment, submission, group, auth, progress, analytics)
│   │   ├── validators/ (course, assignment, group, auth)
│   │   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── analytics/ (SubmissionStatusChart, CompletionDonutChart, etc.)
│   │   │   └── common/ (Navbar, ProtectedRoute, SubmissionStatus, CircularProgress, etc.)
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── pages/
│   │   │   ├── StudentAssignmentDetailsPage.jsx  <-- Visual Dossier Redesign
│   │   │   ├── StudentDashboard.jsx              <-- Real data scheduling & cards
│   │   │   ├── AdminDashboard.jsx                <-- Professor Control Wall
│   │   │   ├── AdminSubmissionsPage.jsx          <-- 6-status audit matrix
│   │   │   ├── CourseDetailsPage.jsx             <-- Course syllabus & roster
│   │   │   ├── CreateAssignmentPage.jsx          <-- Coursework authoring
│   │   │   ├── EditAssignmentPage.jsx            <-- Coursework modification
│   │   │   ├── RegisterPage.jsx                  <-- Student & Professor registration
│   │   │   └── LoginPage.jsx                     <-- 1-Click demo logins
│   │   ├── services/ (courseService, submissionService, assignmentService, progressService)
│   │   └── App.jsx                               <-- App routes & navigation
└── README.md
```

---

## 👨‍💻 Submission & Verification Details
- **Candidate**: Madugu Shiva Kumar
- **Task**: Joineazy Full Stack Round 2 Complete Implementation
- **Status**: Production Ready & Fully Verified
- **Automated Test Success Rate**: 100% (169/169 Assertions Passing)

