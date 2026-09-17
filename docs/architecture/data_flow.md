# Joineazy Core Data Flows & Business Processes

This document details the lifecycle and sequence of key data flows across the system.

---

## 1. Authentication & Session Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Admin
    participant UI as React Client (Login.jsx)
    participant AuthAPI as Auth Controller (/api/auth/login)
    participant AuthService as Auth Service
    participant UserRepo as User Repository
    participant DB as PostgreSQL (users table)

    User->>UI: Enter Email & Password
    UI->>AuthAPI: POST /api/auth/login { email, password }
    AuthAPI->>AuthService: login({ email, password })
    AuthService->>UserRepo: findByEmail(email)
    UserRepo->>DB: SELECT * FROM users WHERE email = $1
    DB-->>UserRepo: Row with password_hash
    UserRepo-->>AuthService: User entity
    AuthService->>AuthService: bcrypt.compare(password, password_hash)
    alt Invalid Password / User Not Found
        AuthService-->>AuthAPI: 401 Unauthorized ("Invalid email or password.")
        AuthAPI-->>UI: Display generic error notification
    else Credentials Valid
        AuthService->>AuthService: sanitizeUser(user) [Strips password_hash]
        AuthService->>AuthService: generateToken({ id, email, role })
        AuthService-->>AuthAPI: { user: safeUser, token: signedJWT }
        AuthAPI-->>UI: 200 OK with safeUser & Bearer Token
        UI->>UI: Store token & profile in localStorage
        UI->>UI: Redirect to /admin/dashboard or /student/dashboard
    end
```

---

## 2. Student Group Management Flow

1. **Group Creation**:
   - `POST /api/groups { name }`
   - Authenticated student ID is passed to `group.service.js`.
   - `group.repository.js` executes an atomic SQL transaction: inserts into `groups` table, then inserts the creator into `group_members` with `joined_at = CURRENT_TIMESTAMP`.
   - Returns `{ group, member_count: 1, is_creator: true }`.

2. **Member Addition**:
   - `POST /api/groups/:id/members { email | studentId }`
   - Object-level authorization checks: Is requester a member of the group?
   - Target student resolution: Fetches student by institutional email or student ID. Rejects admins (`role !== 'STUDENT'`).
   - Duplicate membership check: Prevents duplicate addition (`409 Conflict`).
   - Inserts member into `group_members`.

3. **Member Removal & Self-Leave**:
   - `DELETE /api/groups/:id/members/:studentId`
   - Creator Anchor Protection: Group creator cannot be removed from the group (`400 Bad Request`).
   - Object authorization: Only group creators can remove other members. Regular members may only remove themselves.

---

## 3. Assignment Distribution & Allocation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Professor / Admin
    participant UI as Coursework UI (CreateAssignmentPage.jsx)
    participant AssignAPI as Assignment Controller
    participant AssignService as Assignment Service
    participant AssignRepo as Assignment Repository
    participant DB as PostgreSQL (assignments, assignment_groups)

    Admin->>UI: Enter Title, Description, Due Date, OneDrive URL, Target Groups
    UI->>AssignAPI: POST /api/assignments { title, dueDate, onedriveLink, groupIds, assignAll }
    AssignAPI->>AssignService: createAssignment(...)
    AssignService->>AssignRepo: createWithTransaction(...)
    AssignRepo->>DB: BEGIN TRANSACTION
    AssignRepo->>DB: INSERT INTO assignments (...) RETURNING *
    alt assignAll = true
        AssignRepo->>DB: INSERT INTO assignment_groups (assignment_id, group_id) SELECT id FROM groups
    else Specific groupIds provided
        AssignRepo->>DB: INSERT INTO assignment_groups (...) VALUES (id, gid)
    end
    AssignRepo->>DB: COMMIT TRANSACTION
    AssignRepo-->>AssignService: Created assignment with assigned_groups roster
    AssignService-->>AssignAPI: Assignment DTO
    AssignAPI-->>UI: 201 Created { success: true, data: { assignment } }
```

---

## 4. Two-Step Student Submission Confirmation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Enrolled Group Member
    participant UI as Coursework Feed / Modal
    participant SubAPI as Submission Controller (/api/submissions/confirm)
    participant SubService as Submission Service
    participant SubRepo as Submission Repository
    participant DB as PostgreSQL (submissions table)

    Student->>UI: Clicks "Launch OneDrive Submission Folder"
    UI->>UI: Opens professor's verified OneDrive link in new tab
    Student->>UI: Returns to Joineazy, clicks "Confirm Submission"
    UI->>UI: Displays verification modal warning (group-wide binding confirmation)
    Student->>UI: Checks acknowledgment checkbox and clicks "Confirm Now"
    UI->>SubAPI: POST /api/submissions/confirm { assignmentId, groupId, confirmationAcknowledged: true }
    SubAPI->>SubService: confirmSubmission(studentId, { assignmentId, groupId })
    SubService->>SubService: Check assignment is allocated to group
    SubService->>SubService: Check student is member of group
    SubService->>SubRepo: findByAssignmentAndGroup(assignmentId, groupId)
    alt Already Confirmed
        SubService-->>SubAPI: { submission, alreadyConfirmed: true }
        SubAPI-->>UI: 200 OK ("Submission already confirmed for this group.")
    else First-Time Confirmation
        SubService->>SubRepo: upsertSubmission(assignmentId, groupId, confirmedBy, status: 'CONFIRMED')
        SubRepo->>DB: INSERT INTO submissions (...) ON CONFLICT DO UPDATE ...
        DB-->>SubRepo: Updated submission record
        SubRepo-->>SubService: Submission entity
        SubService-->>SubAPI: { submission, alreadyConfirmed: false }
        SubAPI-->>UI: 200 OK ("Submission confirmed successfully.")
        UI->>UI: Submission pill transitions to CONFIRMED
        UI->>UI: Progress bar recalculates instantaneously
    end
```

---

## 5. Dynamic Progress Calculation & Monitoring Flow

Group progress is calculated dynamically in SQL without stale duplicate counters:

$$\text{Progress Percentage} = \begin{cases} 0\% & \text{if Total Coursework} = 0 \\ \operatorname{round}\left(\frac{\text{Completed Assignments}}{\text{Total Assigned Coursework}} \times 100\right) & \text{otherwise} \end{cases}$$

1. **Student Dashboard Progress**: Evaluated strictly for the student's enrolled groups.
2. **Admin Monitoring**: Roster of all groups with real-time status pills (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`).
3. **Student-Wise Monitoring**: Matrix distinguishing the individual student who clicked confirm (`is_confirmer = true`) from other group teammates covered by the group delivery.

---

## 6. Real-Time Analytics Aggregation Flow

- **`GET /api/analytics/overview`**: Single-statement aggregation calculating institutional totals:
  - `totalStudents`
  - `totalGroups`
  - `totalAssignments`
  - `totalAssignedGroups`
  - `confirmedSubmissions`
  - `pendingSubmissions`
  - `overallCompletionPercentage`
- **`GET /api/analytics/assignments`**: Computes completion percentages per coursework item across allocated groups.
- **`GET /api/analytics/groups`**: Computes group performance percentages ($0\% \to 100\%$) across assigned coursework.
- **`GET /api/analytics/recent-submissions`**: Feed of recent confirmed submissions supporting multi-criteria filtering by assignment, group, and status.
