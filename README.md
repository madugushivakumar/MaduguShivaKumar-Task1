# Joineazy — Student, Group & Assignment Management System

[![Phase](https://img.shields.io/badge/Phase-8%20Analytics%20Complete-emerald.svg)](.)
[![Backend](https://img.shields.io/badge/Node.js-Express%20(Layered)-green.svg)](.)
[![Security](https://img.shields.io/badge/Security-JWT%20+%20RBAC-blue.svg)](.)
[![Database](https://img.shields.io/badge/PostgreSQL-16%20Relational%20Schema-teal.svg)](.)
[![Frontend](https://img.shields.io/badge/React%2018-Tailwind%20CSS%20v3-purple.svg)](.)

## Project Purpose

**Joineazy** is an academic management platform designed for universities and educational institutions to streamline student group collaboration, assignment distributions, OneDrive submission management, and professor evaluation workflows.

---

## Phase Status

- [x] **Phase 1: Project Foundation & Architecture** (Monorepo, Express layered API, React + Tailwind shell, Docker Compose, Health API).
- [x] **Phase 2: PostgreSQL Database Architecture & Data Modeling** (Users, Groups, Group Members, Assignments, Assignment Groups, Submissions, Migration Runner, Seed Data, Reusable Repositories, ER Diagrams).
- [x] **Phase 3: JWT Authentication & Role-Based Access Control (RBAC)** (Student registration, Login, Bcrypt password hashing, JWT signing/verification, authenticateJWT and authorizeRoles middleware, safe GET /api/auth/me, AuthContext, ProtectedRoute, Login and Register UI, Student and Admin dashboards).
- [x] **Phase 4: Student Group Management Module** (Group creation with atomic creator enrollment, group listings, roster management, add/invite members by institutional email or student ID, member removal with creator anchor protection, complete responsive React UI).
- [x] **Phase 5: Professor/Admin Assignment Management Module** (Coursework authoring, deadline scheduling, external OneDrive submission links, atomic bulk & targeted group allocation transactions, student group-filtered coursework discovery, full responsive Admin management UI).
- [x] **Phase 6: Student Coursework & Two-Step Submission Confirmation Module** (Coursework discovery feed with deadline status pills, group-isolated assignment details, external OneDrive link launching, interactive two-step verification modal, group-wide idempotent submission confirmation, teammate synchronization, 17/17 automated test suite).
- [x] **Phase 7: Progress Tracking & Monitoring Module** (Dynamic SQL-calculated group progress, zero-state safety, bounds clamping [0, 100], Student Dashboard progress metrics with visual ProgressBar, Admin Group Progress Roster, Admin Group Coursework details, Admin Assignment Submissions monitoring, Admin Student-Wise confirmation tracking with confirmer vs teammate distinction, 18/18 automated tests).
- [x] **Phase 8: Basic Analytics Module** (Aggregated overview KPIs, per-assignment completion metrics, per-group performance calculations, SVG-based responsive Submission Status Donut and Horizontal Bar charts, multi-criteria filters, comprehensive 26/26 automated test suite).

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), Salted Bcrypt (`bcryptjs`, cost factor 10), Role-based authorization (`STUDENT`, `ADMIN`) |
| **Backend** | Node.js 20+, Express.js 4, Layered Architecture (`Route → Controller → Service → Repository → DB`) |
| **Database** | PostgreSQL 16+, Connection Pooling (`pg.Pool`), DDL Migrations, Seed Runners, Triggers |
| **Frontend** | React.js 18, Vite 5, Tailwind CSS v3, React Router v6, Axios, Lucide Icons, AuthContext |
| **DevOps & Containers** | Docker, Docker Compose, Multi-stage builds, Nginx SPA proxy |

---

## API Endpoints

All responses adhere to a consistent JSON format: `{ success: true, message: "...", data: {} }`.

### Detailed Endpoint Reference

All endpoints return a uniform JSON format: `{ "success": boolean, "message": string, "data"?: any }`.

#### 1. Authentication & Identity (`/api/auth`)

| Endpoint | Auth / Role | Request Body | Success Response | Error Codes |
|---|---|---|---|---|
| `POST /api/auth/register` | Public | `{ name, email, password, studentId }` | `201 Created` `{ user, token }` | `400` (validation), `403` (role tampering), `409` (duplicate email/student ID) |
| `POST /api/auth/login` | Public | `{ email, password }` | `200 OK` `{ user, token }` | `400` (missing fields), `401` (invalid credentials) |
| `GET /api/auth/me` | Bearer JWT (Any) | None | `200 OK` `{ user }` | `401` (missing/expired/invalid token) |

#### 2. Student Group Management (`/api/groups`)

| Endpoint | Auth / Role | Request Body / Params | Success Response | Error Codes |
|---|---|---|---|---|
| `POST /api/groups` | `STUDENT` | `{ name }` | `201 Created` `{ group }` | `400` (short name), `401`, `403` (non-student) |
| `GET /api/groups` | `STUDENT` / `ADMIN` | None | `200 OK` `{ groups, count }` | `401` |
| `GET /api/groups/:id` | Group Member / `ADMIN` | Route param `:id` | `200 OK` `{ group }` | `400` (invalid UUID), `401`, `403` (non-member), `404` |
| `POST /api/groups/:id/members` | Group Member / `ADMIN` | `{ email }` or `{ studentId }` | `200 OK` `{ group, addedMember }` | `400` (invalid UUID/admin target), `401`, `403`, `404`, `409` (duplicate member) |
| `GET /api/groups/:id/members` | Group Member / `ADMIN` | Route param `:id` | `200 OK` `{ members, count }` | `400` (invalid UUID), `401`, `403`, `404` |
| `DELETE /api/groups/:id/members/:studentId` | Creator / Self / `ADMIN` | Route params `:id`, `:studentId` | `200 OK` `{ message }` | `400` (cannot remove creator / non-creator removing other), `401`, `403`, `404` |
| `GET /api/groups/:id/progress` | Group Member / `ADMIN` | Route param `:id` | `200 OK` `{ groupId, totalAssignments, completedAssignments, progressPercentage }` | `400` (invalid UUID), `401`, `403`, `404` |

#### 3. Coursework & Assignment Management (`/api/assignments`)

| Endpoint | Auth / Role | Request Body / Params | Success Response | Error Codes |
|---|---|---|---|---|
| `POST /api/assignments` | `ADMIN` | `{ title, description?, dueDate, onedriveLink, groupIds?, assignAll? }` | `201 Created` `{ assignment }` | `400` (validation, URL protocol), `401`, `403` (student) |
| `GET /api/assignments` | `ADMIN` | None | `200 OK` `{ assignments, count }` | `401`, `403` |
| `GET /api/assignments/student` | `STUDENT` | None | `200 OK` `{ assignments, count }` | `401`, `403` |
| `GET /api/assignments/student/:id` | `STUDENT` | Route param `:id` | `200 OK` `{ assignment }` | `400` (invalid UUID), `401`, `403` (unallocated), `404` |
| `GET /api/assignments/:id` | Allocated Member / `ADMIN` | Route param `:id` | `200 OK` `{ assignment }` | `400` (invalid UUID), `401`, `403`, `404` |
| `PUT /api/assignments/:id` | `ADMIN` | `{ title?, description?, dueDate?, onedriveLink? }` | `200 OK` `{ assignment }` | `400` (validation), `401`, `403`, `404` |
| `POST /api/assignments/:id/groups` | `ADMIN` | `{ group_ids: [UUID, ...] }` | `200 OK` `{ assignedGroups, totalAssigned }` | `400` (invalid array/UUID), `401`, `403`, `404` |
| `POST /api/assignments/:id/assign-all` | `ADMIN` | Route param `:id` | `200 OK` `{ assignedGroups, totalAssigned }` | `400`, `401`, `403`, `404` |
| `DELETE /api/assignments/:id` | `ADMIN` | Route param `:id` | `200 OK` `{ message }` | `400`, `401`, `403`, `404` |

#### 4. Submission Confirmation (`/api/submissions`)

| Endpoint | Auth / Role | Request Body / Params | Success Response | Error Codes |
|---|---|---|---|---|
| `POST /api/submissions/confirm` | `STUDENT` (Group Member) | `{ assignmentId, groupId, confirmationAcknowledged: true }` | `200 OK` `{ submission, alreadyConfirmed }` | `400` (unallocated assignment/missing params), `401`, `403` (non-member) |
| `GET /api/submissions/:assignmentId/:groupId` | `STUDENT` / `ADMIN` | Route params `:assignmentId`, `:groupId` | `200 OK` `{ submission }` | `400` (invalid UUIDs), `401`, `403` (non-member), `404` |

#### 5. Admin Monitoring & Audit Feed (`/api/admin`)

| Endpoint | Auth / Role | Query / Route Params | Success Response | Error Codes |
|---|---|---|---|---|
| `GET /api/admin/dashboard/summary` | `ADMIN` | None | `200 OK` `{ totalStudents, totalGroups, totalAssignments, ... }` | `401`, `403` (student) |
| `GET /api/admin/groups` | `ADMIN` | `?search=&status=` | `200 OK` `{ groups, count }` | `401`, `403` |
| `GET /api/admin/groups/:id` | `ADMIN` | Route param `:id` | `200 OK` `{ group, members, assignments }` | `400` (invalid UUID), `401`, `403`, `404` |
| `GET /api/admin/submissions` | `ADMIN` | `?assignmentId=&groupId=&search=` | `200 OK` `{ submissions, count }` | `401`, `403` |
| `GET /api/admin/submissions/assignment/:assignmentId` | `ADMIN` | Route param `:assignmentId` | `200 OK` `{ assignment, groups, completionPercentage }` | `400` (invalid UUID), `401`, `403`, `404` |
| `GET /api/admin/submissions/group/:groupId` | `ADMIN` | Route param `:groupId` | `200 OK` `{ group, members, assignments }` | `400` (invalid UUID), `401`, `403`, `404` |
| `GET /api/admin/submissions/student-wise` | `ADMIN` | `?assignmentId=&groupId=&search=` | `200 OK` `{ records, count }` | `401`, `403` |

#### 6. Basic Analytics (`/api/analytics`)

| Endpoint | Auth / Role | Query / Route Params | Success Response | Error Codes |
|---|---|---|---|---|
| `GET /api/analytics/overview` | `ADMIN` | None | `200 OK` `{ totalStudents, totalGroups, totalAssignments, totalAssignedGroups, confirmedSubmissions, pendingSubmissions, overallCompletionPercentage }` | `401`, `403` (student) |
| `GET /api/analytics/assignments` | `ADMIN` | `?search=` | `200 OK` `{ assignments: [{ assignmentId, title, totalGroups, confirmedGroups, pendingGroups, completionPercentage }], count }` | `401`, `403` |
| `GET /api/analytics/groups` | `ADMIN` | `?search=` | `200 OK` `{ groups: [{ groupId, groupName, memberCount, totalAssignments, completedAssignments, pendingAssignments, progressPercentage }], count }` | `401`, `403` |
| `GET /api/analytics/recent-submissions` | `ADMIN` | `?limit=&assignmentId=&groupId=&status=` | `200 OK` `{ submissions, count }` | `401`, `403` |

---

## Demo Test Credentials

All seed accounts use password: `Password123!`

| Role | Name | Email | Student ID | Dashboard URL |
|---|---|---|---|---|
| **Admin** | Dr. Alan Turing | `dr.alan@university.edu` | *N/A* | `/admin/dashboard` |
| **Admin** | Prof. Sarah Connor | `prof.sarah@university.edu` | *N/A* | `/admin/dashboard` |
| **Student** | Alice Smith | `alice.smith@university.edu` | `STU2026001` | `/student/dashboard` |
| **Student** | Bob Jones | `bob.jones@university.edu` | `STU2026002` | `/student/dashboard` |
| **Student** | Charlie Brown | `charlie.brown@university.edu` | `STU2026003` | `/student/dashboard` |
| **Student** | Diana Prince | `diana.prince@university.edu` | `STU2026004` | `/student/dashboard` |
| **Student** | Evan Wright | `evan.wright@university.edu` | `STU2026005` | `/student/dashboard` |
| **Student** | Fiona Gallagher | `fiona.gallagher@university.edu` | `STU2026006` | `/student/dashboard` |

> [!TIP]
> The Login page (`/login`) includes **1-Click Quick-Fill buttons** for both Student and Admin demo accounts.

---

## Commands Summary

All commands are run from the project root:

```bash
# 1. Install all dependencies (root, backend, frontend)
npm run install:all

# 2. Run Database Migrations
npm run db:migrate

# 3. Seed Database with Test Accounts & Data
npm run db:seed

# 4. Run Complete 18-Point Database Verification Suite
npm run db:verify

# 5. Run 16-Case Authentication & RBAC Test Suite
npm run auth:test

# 6. Run 17-Case Student Group Management Test Suite
npm run group:test

# 7. Run 17-Case Assignment Management Test Suite
npm run assignment:test

# 8. Run 17-Case Student Submission Confirmation Test Suite
npm run submission:test

# 9. Run 18-Case Progress Tracking & Monitoring Test Suite
npm run progress:test

# 10. Run 26-Case Basic Analytics Test Suite
npm run analytics:test

# 11. Start Full Development Environment (Backend + Frontend)
npm run dev

# 12. Start Services Individually
npm run dev:backend   # API on http://localhost:5000
npm run dev:frontend  # Web client on http://localhost:5173

# 13. Run Production Build
npm run build

# 14. Launch via Docker Compose
docker compose up --build
```

---

## Automated Test Suites

### 1. Basic Analytics Test Suite (`npm run analytics:test` — 26/26 PASS)
- [x] Admin authenticates successfully and obtains JWT token
- [x] Student authenticates successfully and obtains JWT token
- [x] `GET /api/analytics/overview` returns 200 OK for Admin
- [x] Overview returns all 7 required metric keys (`totalStudents`, `totalGroups`, `totalAssignments`, `totalAssignedGroups`, `confirmedSubmissions`, `pendingSubmissions`, `overallCompletionPercentage`)
- [x] Overview confirmed + pending equals totalAssignedGroups
- [x] Overview overallCompletionPercentage matches mathematical calculation
- [x] `GET /api/analytics/assignments` returns 200 OK with assignments array
- [x] Assignment analytics object contains all required fields (`totalGroups`, `confirmedGroups`, `pendingGroups`, `completionPercentage`)
- [x] All assignments satisfy: `confirmedGroups + pendingGroups === totalGroups`
- [x] All assignments have strictly correct `completionPercentage` calculations
- [x] `GET /api/analytics/assignments` search filter functions correctly
- [x] `GET /api/analytics/groups` returns 200 OK with groups array
- [x] Group analytics object contains all required fields (`memberCount`, `totalAssignments`, `completedAssignments`, `pendingAssignments`, `progressPercentage`)
- [x] All groups satisfy: `completedAssignments + pendingAssignments === totalAssignments`
- [x] All groups have strictly correct `progressPercentage` calculations
- [x] `GET /api/analytics/groups` search filter functions correctly
- [x] `GET /api/analytics/recent-submissions` returns 200 OK
- [x] Recent submissions filter by `status=CONFIRMED` returns confirmed items only
- [x] Student access to `GET /api/analytics/overview` rejected with 403 Forbidden
- [x] Student access to `GET /api/analytics/assignments` rejected with 403 Forbidden
- [x] Student access to `GET /api/analytics/groups` rejected with 403 Forbidden
- [x] Unauthenticated request to `/api/analytics/overview` rejected with 401 Unauthorized
- [x] Dynamic state reflection: submission confirmation instantaneously updates assignment analytics
- [x] Dynamic state reflection: submission confirmation instantaneously updates group performance analytics
- [x] Zero-allocation scenario calculates 0% cleanly without division by zero
- [x] Database performance benchmark: all 3 analytics aggregations execute concurrently in under 250ms

### 2. Assignment Management Test Suite (`npm run assignment:test` — 17/17 PASS)
- [x] Admin creates assignment with instructions and OneDrive link (201 Created)
- [x] Student attempting to create assignment rejected (403 Forbidden)
- [x] Unauthenticated assignment creation rejected (401 Unauthorized)
- [x] Empty or short title rejected (400 Bad Request)
- [x] Invalid due date format rejected (400 Bad Request)
- [x] Invalid OneDrive URL protocol rejected (400 Bad Request)
- [x] Admin retrieves managed assignment list (200 OK)
- [x] Admin updates assignment details (200 OK)
- [x] Student attempting to edit assignment rejected (403 Forbidden)
- [x] Update nonexistent assignment rejected (404 Not Found)
- [x] Admin assigns assignment to specific groups via junction table (200 OK)
- [x] Duplicate group assignment handled cleanly & idempotently (200 OK)
- [x] Assign to nonexistent group ID rejected (404 Not Found)
- [x] Student assignment discovery returns only enrolled group coursework (200 OK)
- [x] Outside student without membership does NOT receive unallocated assignment (200 OK)
- [x] Student viewing non-allocated assignment details rejected (403 Forbidden)
- [x] Admin assigns assignment to all system groups atomically (200 OK)

### 3. Group Management Test Suite (`npm run group:test` — 17/17 PASS)
- [x] Student group creation with creator auto-enrollment (201 Created)
- [x] Empty or short group name rejected (400 Bad Request)
- [x] Unauthenticated group creation rejected (401 Unauthorized)
- [x] Admin group creation rejected (403 Forbidden, Student only)
- [x] Student group listing isolated to relevant teams
- [x] Group details retrieval with member roster and creator metadata
- [x] Unauthorized student accessing non-member group forbidden (403 Forbidden)
- [x] Add student member by institutional email
- [x] Add student member by student ID
- [x] Add nonexistent student rejected (404 Not Found)
- [x] Add administrator or faculty as student member rejected (400 Bad Request)
- [x] Duplicate member addition rejected (409 Conflict)
- [x] Unauthorized student adding members rejected (403 Forbidden)
- [x] List group members endpoint
- [x] Creator removing a member succeeded (200 OK)
- [x] Attempt to remove group creator rejected (400 Bad Request)
- [x] Non-creator student removing another member forbidden (400/403)

### 4. Authentication & RBAC Test Suite (`npm run auth:test` — 16/16 PASS)
- [x] Student registration with valid data (201 Created)
- [x] Duplicate email registration rejected (409 Conflict)
- [x] Duplicate student ID registration rejected (409 Conflict)
- [x] Invalid registration input rejected (400 Bad Request)
- [x] Role tampering prevented (`role: "ADMIN"` rejected with 403)
- [x] Successful student login & JWT issuance
- [x] Wrong password rejected (401 Unauthorized)
- [x] Nonexistent email rejected (401 Unauthorized)
- [x] Missing JWT token rejected (401 Unauthorized)
- [x] Malformed JWT token rejected (401 Unauthorized)
- [x] Invalid JWT signature rejected (401 Unauthorized)
- [x] Student accessing Admin API rejected (403 Forbidden)
- [x] Admin accessing Admin API permitted (200 OK)
- [x] `GET /api/auth/me` retrieves authenticated user profile
- [x] Student accessing Student API permitted (200 OK)
- [x] Admin accessing Student API rejected (403 Forbidden)

### 5. Student Submission Confirmation Test Suite (`npm run submission:test` — 17/17 PASS)
- [x] Student views coursework feed (`GET /api/assignments/student` returns allocated tasks)
- [x] Student views specific assignment details (`GET /api/assignments/student/:id`)
- [x] Student viewing non-allocated assignment rejected (403 Forbidden)
- [x] Student viewing nonexistent assignment rejected (404 Not Found)
- [x] Invalid assignment UUID format rejected (400 Bad Request)
- [x] Unauthenticated confirmation request rejected (401 Unauthorized)
- [x] Admin attempts confirmation rejected by RBAC (403 Forbidden - Student only)
- [x] Confirmation with missing required fields rejected (400 Bad Request)
- [x] Confirmation with invalid UUID rejected (400 Bad Request)
- [x] Confirmation by non-group member rejected (403 Forbidden)
- [x] Confirmation for unallocated assignment rejected (400 Bad Request)
- [x] Student successfully confirms submission (200 OK, `alreadyConfirmed: false`)
- [x] Group submission status query (`GET /api/submissions/:assignmentId/:groupId`)
- [x] Confirmed status & metadata reflected in student feed (`GET /api/assignments/student`)
- [x] Confirmed status & metadata reflected in student details (`GET /api/assignments/student/:id`)
- [x] Idempotent re-confirmation returns success (200 OK, `alreadyConfirmed: true`)
- [x] Teammate synchronization: Teammate observes `CONFIRMED` status and confirmer's name

---

## What Phase 9 Will Implement

Phase 9 will focus on Evaluation, Grading & Feedback Loops:
1. **Professor Assessment & Grading**: Grade entry (numerical/letter) and qualitative feedback per group assignment submission.
2. **Student Feedback Portal**: Enabling student group members to review professor evaluation, notes, and rubric scores.
3. **Audit History & Evaluation Logs**: Immutable audit trails for grade revisions and submission evaluations.
