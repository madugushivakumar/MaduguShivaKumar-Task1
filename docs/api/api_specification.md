# Joineazy REST API Specification

## Base URL
- **Local Development**: `http://localhost:5000/api`
- **Docker Compose**: `http://localhost:5000/api` (or internal `http://backend:5000/api`)

---

## 1. Authentication Endpoints (`/api/auth`)

All authentication routes return standard JSON responses:
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {}
}
```

### 1.1 Register Student Account
- **URL**: `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new Student account. Role tampering is prohibited; public registrations are strictly assigned the `STUDENT` role.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Alice Smith",
  "email": "alice.smith@university.edu",
  "password": "Password123!",
  "studentId": "STU2026001"
}
```
- **Response Status**: `201 Created`
- **Response Body**:
```json
{
  "success": true,
  "message": "Student registration successful.",
  "data": {
    "user": {
      "id": "b0000000-0000-0000-0000-000000000001",
      "name": "Alice Smith",
      "email": "alice.smith@university.edu",
      "role": "STUDENT",
      "student_id": "STU2026001",
      "created_at": "2026-09-15T10:00:00.000Z",
      "updated_at": "2026-09-15T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Errors**:
  - `400 Bad Request`: Missing/invalid fields or password less than 8 characters.
  - `403 Forbidden`: Role tampering attempted (e.g. sending `role: "ADMIN"`).
  - `409 Conflict`: Email or student ID is already registered.

---

### 1.2 Login & Token Issuance
- **URL**: `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticates email and password, issuing a signed JSON Web Token (HS256).
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "dr.alan@university.edu",
  "password": "Password123!"
}
```
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "a0000000-0000-0000-0000-000000000001",
      "name": "Dr. Alan Turing",
      "email": "dr.alan@university.edu",
      "role": "ADMIN",
      "student_id": null,
      "created_at": "2026-09-15T10:00:00.000Z",
      "updated_at": "2026-09-15T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Errors**:
  - `400 Bad Request`: Email or password omitted.
  - `401 Unauthorized`: Invalid email or password (generic message prevents account enumeration).

---

### 1.3 Get Current User Profile
- **URL**: `GET /api/auth/me`
- **Access**: Authenticated (`STUDENT`, `ADMIN`)
- **Description**: Retrieves the sanitized profile of the user identified by the Bearer token.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully.",
  "data": {
    "user": {
      "id": "b0000000-0000-0000-0000-000000000001",
      "name": "Alice Smith",
      "email": "alice.smith@university.edu",
      "role": "STUDENT",
      "student_id": "STU2026001",
      "created_at": "2026-09-15T10:00:00.000Z",
      "updated_at": "2026-09-15T10:00:00.000Z"
    }
  }
}
```
- **Errors**:
  - `401 Unauthorized`: Token missing, expired, or signature invalid.

---

### 1.4 Student Role Guard Verification
- **URL**: `GET /api/auth/test-student`
- **Access**: `STUDENT` only
- **Response**: `200 OK` if role is `STUDENT`; `403 Forbidden` if role is `ADMIN`.

### 1.5 Admin Role Guard Verification
- **URL**: `GET /api/auth/test-admin`
- **Access**: `ADMIN` only
- **Response**: `200 OK` if role is `ADMIN`; `403 Forbidden` if role is `STUDENT`.

---

## 2. Health Check Endpoints (`/api/health`)

### 2.1 Basic Health Check
- **URL**: `GET /api/health`
- **Response Status**: `200 OK`
```json
{
  "success": true,
  "message": "Joineazy API is running"
}
```

### 2.2 Detailed Health Check & DB Diagnostics
- **URL**: `GET /api/health/details`
- **Response Status**: `200 OK`
```json
{
  "success": true,
  "message": "Joineazy API is running",
  "environment": "development",
  "uptime": 12.34,
  "timestamp": "2026-09-15T10:00:00.000Z",
  "services": {
    "api": "operational",
    "database": "connected",
    "dbLatencyMs": 14
  }
}
```

---

## 3. Error Handling Format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "stack": "Error stack trace (development mode only)"
}
```

HTTP Status Codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully registered/created.
- `400 Bad Request`: Input validation failed or business rule violation (e.g. attempting to remove creator or add admin).
- `401 Unauthorized`: Authentication missing, expired, or invalid credentials.
- `403 Forbidden`: Insufficient role authority (e.g. Student accessing non-member group, or Admin calling student-only group API).
- `404 Not Found`: Target route or resource does not exist (e.g. student email/ID not found).
- `409 Conflict`: Unique constraint violation (e.g. student already a member).
- `500 Internal Server Error`: Unhandled operational exception.

---

## 4. Student Group Management Endpoints (`/api/groups`)

All group endpoints require valid authentication (`Authorization: Bearer <token>`).

### 4.1 Create Student Group
- **URL**: `POST /api/groups`
- **Access**: `STUDENT` role only
- **Description**: Creates a new group. The authenticated student is automatically set as the group creator (`created_by = req.user.id`) and atomically enrolled as the first member within a database transaction.
- **Request Body**:
```json
{
  "name": "Team Alpha"
}
```
- **Response Status**: `201 Created`
- **Response Body**:
```json
{
  "success": true,
  "message": "Group 'Team Alpha' created successfully.",
  "data": {
    "group": {
      "id": "606c7049-c451-42c8-bc73-f0b8a27ec06d",
      "name": "Team Alpha",
      "created_by": "b0000000-0000-0000-0000-000000000001",
      "created_at": "2026-09-15T11:00:00.000Z",
      "updated_at": "2026-09-15T11:00:00.000Z"
    },
    "membership": {
      "id": "m0000000-0000-0000-0000-000000000001",
      "group_id": "606c7049-c451-42c8-bc73-f0b8a27ec06d",
      "student_id": "b0000000-0000-0000-0000-000000000001",
      "joined_at": "2026-09-15T11:00:00.000Z"
    }
  }
}
```
- **Errors**:
  - `400 Bad Request`: Name omitted or less than 2 characters.
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Authenticated user is not a `STUDENT` (Admins cannot create student groups).

---

### 4.2 List Relevant Groups
- **URL**: `GET /api/groups`
- **Access**: Authenticated (`STUDENT`, `ADMIN`)
- **Description**: Returns all groups relevant to the authenticated user. For students, returns only groups they are enrolled in or created. For administrators, returns all system groups.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "Groups retrieved successfully.",
  "data": {
    "count": 1,
    "groups": [
      {
        "id": "606c7049-c451-42c8-bc73-f0b8a27ec06d",
        "name": "Team Alpha",
        "created_by": "b0000000-0000-0000-0000-000000000001",
        "created_at": "2026-09-15T11:00:00.000Z",
        "updated_at": "2026-09-15T11:00:00.000Z",
        "creator_name": "Alice Smith",
        "creator_email": "alice.smith@university.edu",
        "member_count": 2,
        "is_creator": true
      }
    ]
  }
}
```

---

### 4.3 Get Group Details & Member Roster
- **URL**: `GET /api/groups/:id`
- **Access**: Group Members or `ADMIN`
- **Description**: Retrieves full metadata for a group, including creator information and the complete member roster. Non-members receive `403 Forbidden`.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "Group details retrieved successfully.",
  "data": {
    "group": {
      "id": "606c7049-c451-42c8-bc73-f0b8a27ec06d",
      "name": "Team Alpha",
      "created_by": "b0000000-0000-0000-0000-000000000001",
      "creator_name": "Alice Smith",
      "creator_email": "alice.smith@university.edu",
      "is_creator": true,
      "member_count": 2,
      "members": [
        {
          "membership_id": "m1",
          "student_id": "b0000000-0000-0000-0000-000000000001",
          "name": "Alice Smith",
          "email": "alice.smith@university.edu",
          "institutional_id": "STU2026001",
          "joined_at": "2026-09-15T11:00:00.000Z"
        },
        {
          "membership_id": "m2",
          "student_id": "b0000000-0000-0000-0000-000000000002",
          "name": "Bob Jones",
          "email": "bob.jones@university.edu",
          "institutional_id": "STU2026002",
          "joined_at": "2026-09-15T11:05:00.000Z"
        }
      ]
    }
  }
}
```
- **Errors**:
  - `403 Forbidden`: Requester is not an enrolled member of the group.
  - `404 Not Found`: Group does not exist.

---

### 4.4 Invite / Add Member to Group
- **URL**: `POST /api/groups/:id/members`
- **Access**: Group Members only
- **Description**: Adds an eligible student to the group. The student can be identified by either institutional `email` or `studentId`.
- **Request Body Options**:
```json
{
  "email": "charlie.brown@university.edu"
}
```
*or*
```json
{
  "studentId": "STU2026003"
}
```
- **Response Status**: `201 Created`
- **Response Body**:
```json
{
  "success": true,
  "message": "Student 'Charlie Brown' added to group successfully.",
  "data": {
    "membership": {
      "id": "m3",
      "group_id": "606c7049-c451-42c8-bc73-f0b8a27ec06d",
      "student_id": "b0000000-0000-0000-0000-000000000003",
      "joined_at": "2026-09-15T11:10:00.000Z"
    },
    "addedMember": {
      "id": "b0000000-0000-0000-0000-000000000003",
      "name": "Charlie Brown",
      "email": "charlie.brown@university.edu",
      "studentId": "STU2026003"
    },
    "memberCount": 3
  }
}
```
- **Errors**:
  - `400 Bad Request`: Missing identifier or student is an Administrator/Faculty.
  - `403 Forbidden`: Requester is not a member of the group.
  - `404 Not Found`: No student account found with the provided email or ID.
  - `409 Conflict`: Target student is already a member of this group.

---

### 4.5 List Group Members
- **URL**: `GET /api/groups/:id/members`
- **Access**: Group Members or `ADMIN`
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "Group members retrieved successfully.",
  "data": {
    "count": 2,
    "members": [ ... ]
  }
}
```

---

### 4.6 Remove Member from Group
- **URL**: `DELETE /api/groups/:id/members/:studentId`
- **Access**: Group Creator (to remove others) OR Student (to self-remove / leave group)
- **Description**: Removes the specified student from `group_members`.
- **Business Rule Decision**: The group creator cannot be removed from `group_members` (`400 Bad Request`). This preserves group ownership and accountability.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "Member removed from group successfully.",
  "data": {
    "removedStudentId": "b0000000-0000-0000-0000-000000000002",
    "memberCount": 1
  }
}
```
- **Errors**:
  - `400 Bad Request`: Attempting to remove the group creator.
  - `403 Forbidden`: Non-creator student attempting to remove another student.
  - `404 Not Found`: Student is not a member of the group.

---

## 5. Assignment Management Endpoints (`/api/assignments`)

All assignment endpoints require valid authentication (`Authorization: Bearer <token>`).

### 5.1 Create Assignment
- **URL**: `POST /api/assignments`
- **Access**: `ADMIN` role only (Students receive `403 Forbidden`)
- **Description**: Creates an assignment record and optionally allocates it immediately to all groups or selected groups within an atomic PostgreSQL transaction.
- **Request Body**:
```json
{
  "title": "Distributed Consensus & Raft Protocol",
  "description": "Implement Raft leader election, heartbeats, and state replication.",
  "due_date": "2026-10-15T23:59:00.000Z",
  "onedrive_link": "https://onedrive.live.com/?id=sample-course-folder-2026",
  "assign_all": true
}
```
- **Response Status**: `201 Created`
- **Response Body**:
```json
{
  "success": true,
  "message": "Assignment 'Distributed Consensus & Raft Protocol' created successfully.",
  "data": {
    "assignment": {
      "id": "f32e3371-d487-4996-a007-75b2fe97855f",
      "title": "Distributed Consensus & Raft Protocol",
      "description": "Implement Raft leader election, heartbeats, and state replication.",
      "due_date": "2026-10-15T23:59:00.000Z",
      "onedrive_link": "https://onedrive.live.com/?id=sample-course-folder-2026",
      "created_by": "a0000000-0000-0000-0000-000000000001",
      "created_at": "2026-09-15T11:45:00.000Z",
      "updated_at": "2026-09-15T11:45:00.000Z",
      "assigned_groups": [ ... ],
      "assigned_groups_count": 6
    }
  }
}
```
- **Errors**:
  - `400 Bad Request`: Missing/short title, invalid due date, or invalid OneDrive URL.
  - `401 Unauthorized`: No token provided.
  - `403 Forbidden`: Authenticated user is not an `ADMIN`.

---

### 5.2 List All Managed Assignments
- **URL**: `GET /api/assignments`
- **Access**: `ADMIN` role only
- **Description**: Retrieves all assignments with assigned group summaries and submission statistics.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "Assignments retrieved successfully.",
  "data": {
    "count": 1,
    "assignments": [
      {
        "id": "f32e3371-d487-4996-a007-75b2fe97855f",
        "title": "Distributed Consensus & Raft Protocol",
        "description": "...",
        "due_date": "2026-10-15T23:59:00.000Z",
        "onedrive_link": "https://onedrive.live.com/...",
        "created_by": "a0000000-0000-0000-0000-000000000001",
        "professor_name": "Dr. Alan Turing",
        "professor_email": "dr.alan@university.edu",
        "assigned_groups_count": 6,
        "assigned_groups": [ { "id": "...", "name": "Team Alpha" } ]
      }
    ]
  }
}
```

---

### 5.3 Student Coursework Discovery Feed
- **URL**: `GET /api/assignments/student`
- **Access**: `STUDENT` role only
- **Description**: Retrieves only coursework assigned to groups that the authenticated student is currently enrolled in. Students never receive unallocated or unrelated assignments.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "Student coursework retrieved successfully.",
  "data": {
    "count": 1,
    "assignments": [
      {
        "id": "f32e3371-d487-4996-a007-75b2fe97855f",
        "title": "Distributed Consensus & Raft Protocol",
        "description": "...",
        "due_date": "2026-10-15T23:59:00.000Z",
        "onedrive_link": "https://onedrive.live.com/...",
        "group_id": "606c7049-c451-42c8-bc73-f0b8a27ec06d",
        "group_name": "Team Alpha",
        "assigned_at": "2026-09-15T11:45:00.000Z"
      }
    ]
  }
}
```

---

### 5.4 Get Assignment Details & Group Roster
- **URL**: `GET /api/assignments/:id`
- **Access**: `ADMIN` or `STUDENT` (if coursework is allocated to student's group)
- **Description**: Returns full metadata, instructions, creator details, and list of allocated student groups.
- **Errors**:
  - `403 Forbidden`: Student requesting coursework not allocated to their groups.
  - `404 Not Found`: Assignment does not exist.

---

### 5.5 Update Assignment
- **URL**: `PUT /api/assignments/:id`
- **Access**: `ADMIN` role only
- **Description**: Updates assignment title, description, due date, or OneDrive submission URL. Preserves existing group mappings without unintentional detachment.
- **Request Body**:
```json
{
  "title": "Distributed Consensus & Raft Protocol (Revised Guidelines)",
  "due_date": "2026-10-20T23:59:00.000Z"
}
```
- **Response Status**: `200 OK`

---

### 5.6 Allocate Assignment to Specific Groups
- **URL**: `POST /api/assignments/:id/groups`
- **Access**: `ADMIN` role only
- **Description**: Maps assignment to the provided array of group UUIDs inside an atomic database transaction. Duplicate mappings are handled idempotently via `ON CONFLICT (assignment_id, group_id) DO NOTHING`.
- **Request Body**:
```json
{
  "group_ids": [
    "606c7049-c451-42c8-bc73-f0b8a27ec06d",
    "73de0206-0c53-4a78-be54-84df3f6896a3"
  ]
}
```
- **Response Status**: `200 OK`
- **Errors**:
  - `400 Bad Request`: `group_ids` is empty or contains non-UUID strings.
  - `404 Not Found`: Target assignment or any of the specified group IDs do not exist.

---

### 5.7 Allocate Assignment to All Groups
- **URL**: `POST /api/assignments/:id/assign-all`
- **Access**: `ADMIN` role only
- **Description**: The server queries all existing active groups and performs a bulk mapping into `assignment_groups` within an atomic PostgreSQL transaction.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "Assignment allocated to all groups successfully.",
  "data": {
    "assignmentId": "f32e3371-d487-4996-a007-75b2fe97855f",
    "assignedGroups": [ ... ],
    "totalAssigned": 7
  }
}
```

---

### 5.8 Delete Assignment
- **URL**: `DELETE /api/assignments/:id`
- **Access**: `ADMIN` role only
- **Response Status**: `200 OK`

---

## 6. Submission Confirmation Endpoints (`/api/submissions`)

All submission confirmation endpoints require valid authentication with the `STUDENT` role. Faculty/Administrators receive `403 Forbidden` if attempting to confirm on behalf of student groups.

### 6.1 Confirm Assignment Submission (Two-Step Verification Protocol)
- **URL**: `POST /api/submissions/confirm`
- **Access**: `STUDENT` role only (must be an active member of `groupId`)
- **Description**: Records a formal confirmation that the student's project team has uploaded their deliverables to the instructor-designated OneDrive folder. Follows a two-step verification flow on the client and is idempotent at the database level via unique constraint `(assignment_id, group_id)`. If any team member confirms, the entire group's status becomes `CONFIRMED`.
- **Request Body**:
```json
{
  "assignment_id": "f32e3371-d487-4996-a007-75b2fe97855f",
  "group_id": "c0000000-0000-0000-0000-000000000001"
}
```
*(Accepts either snake_case `assignment_id`/`group_id` or camelCase `assignmentId`/`groupId`)*

- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "message": "Assignment submission successfully confirmed.",
  "data": {
    "submission": {
      "id": "e0000000-0000-0000-0000-000000000001",
      "assignment_id": "f32e3371-d487-4996-a007-75b2fe97855f",
      "group_id": "c0000000-0000-0000-0000-000000000001",
      "status": "CONFIRMED",
      "confirmed_by": "b0000000-0000-0000-0000-000000000001",
      "confirmed_by_name": "Alice Smith",
      "confirmed_by_email": "alice.smith@university.edu",
      "group_name": "Alpha Innovators",
      "assignment_title": "Distributed Consensus & Raft Protocol",
      "confirmed_at": "2026-09-15T12:26:04.746Z"
    },
    "alreadyConfirmed": false
  }
}
```
- **Idempotent Subsequent Calls**:
  If another or same member re-confirms, the existing submission is returned with `"alreadyConfirmed": true` without creating duplicate records or throwing an error.
- **Errors**:
  - `400 Bad Request`: Missing `assignment_id` or `group_id`, invalid UUID syntax, or assignment not allocated to the group.
  - `401 Unauthorized`: No authentication token.
  - `403 Forbidden`: Authenticated user is an `ADMIN`, or student is not a registered member of the specified group.
  - `404 Not Found`: Assignment or group does not exist in the database.

---

### 6.2 Query Submission Status
- **URL**: `GET /api/submissions/:assignmentId/:groupId`
- **Access**: `STUDENT` role (group member)
- **Description**: Retrieves current submission status (`PENDING` or `CONFIRMED`) and metadata for a specific assignment and group combination.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "data": {
    "assignmentId": "f32e3371-d487-4996-a007-75b2fe97855f",
    "groupId": "c0000000-0000-0000-0000-000000000001",
    "status": "CONFIRMED",
    "submission": {
      "id": "e0000000-0000-0000-0000-000000000001",
      "status": "CONFIRMED",
      "confirmed_by": "b0000000-0000-0000-0000-000000000001",
      "confirmed_by_name": "Alice Smith",
      "confirmed_at": "2026-09-15T12:26:04.746Z"
    }
  }
}
```

---

### 6.3 Student Assignment Details with Submission Status
- **URL**: `GET /api/assignments/student/:id`
- **Access**: `STUDENT` role only
- **Query Parameters**: `groupId` (optional, for students enrolled in multiple groups allocated to the same assignment)
- **Description**: Returns detailed coursework instructions, faculty metadata, external OneDrive folder URL, and the current group's submission status and confirmation record.
- **Response Status**: `200 OK`
- **Errors**:
  - `400 Bad Request`: Invalid UUID syntax.
  - `403 Forbidden`: The assignment is not allocated to any group the student belongs to.
  - `404 Not Found`: Assignment does not exist.

---

## 7. Progress Tracking & Monitoring Endpoints

Phase 7 connects the preceding database relationships into a unified progress and monitoring system with real-time dynamic recalculations.

### Progress Formula
$$\text{Progress \%} = \text{totalAssigned} > 0 \;?\; \text{Math.round}\left(\frac{\text{completedAssignments}}{\text{totalAssigned}} \times 100\right) : 0$$

Progress percentages are strictly clamped to $[0, 100]$ bounds and default to `0%` when a group has 0 allocated assignments.

---

### 7.1 Group Progress Query
- **URL**: `GET /api/groups/:id/progress`
- **Access**: `STUDENT` (must belong to group) or `ADMIN`
- **Description**: Returns dynamic progress metrics for the specified group calculated directly from the database schema.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "data": {
    "group": {
      "id": "1b4d034f-fdf1-42c2-9c53-616d0eb72b46",
      "name": "Team Alpha",
      "creator_id": "b0000000-0000-0000-0000-000000000001",
      "creator_name": "Alice Smith"
    },
    "progress": {
      "totalAssigned": 4,
      "completedAssignments": 3,
      "pendingAssignments": 1,
      "progressPercentage": 75
    }
  }
}
```
- **Errors**:
  - `400 Bad Request`: Invalid UUID format.
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Student is not an active member of this group.
  - `404 Not Found`: Group not found.

---

### 7.2 Admin Dashboard Summary
- **URL**: `GET /api/admin/dashboard/summary`
- **Access**: `ADMIN` role only
- **Description**: Returns aggregate high-level metrics for faculty across students, groups, assignments, and total submissions.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "data": {
    "totalStudents": 42,
    "totalGroups": 12,
    "totalAssignments": 8,
    "totalAllocations": 48,
    "confirmedSubmissions": 36,
    "pendingSubmissions": 12,
    "overallCompletionPercentage": 75
  }
}
```

---

### 7.3 Admin Groups Progress Roster
- **URL**: `GET /api/admin/groups`
- **Access**: `ADMIN` role only
- **Query Parameters**:
  - `search` *(optional)*: Filter groups by group name or creator name
  - `page` *(optional, default: 1)*
  - `limit` *(optional, default: 50)*
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "1b4d034f-fdf1-42c2-9c53-616d0eb72b46",
        "name": "Team Alpha",
        "creatorName": "Alice Smith",
        "memberCount": 4,
        "totalAssigned": 4,
        "completedAssignments": 3,
        "pendingAssignments": 1,
        "progressPercentage": 75
      }
    ],
    "pagination": { "total": 12, "page": 1, "limit": 50, "totalPages": 1 }
  }
}
```

---

### 7.4 Admin Group Details with Coursework Roster
- **URL**: `GET /api/admin/groups/:id`
- **Access**: `ADMIN` role only
- **Description**: Returns deep group information including full student roster and coursework breakdown with individual submission timestamps and confirmer names.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "data": {
    "group": {
      "id": "1b4d034f-fdf1-42c2-9c53-616d0eb72b46",
      "name": "Team Alpha",
      "creatorName": "Alice Smith"
    },
    "members": [
      {
        "studentId": "b0000000-0000-0000-0000-000000000001",
        "name": "Alice Smith",
        "email": "alice.smith@university.edu",
        "studentCode": "STU2026001",
        "isCreator": true
      }
    ],
    "coursework": [
      {
        "assignmentId": "a4006dbe-1c16-49c6-be33-f552f55d6979",
        "title": "Raft Consensus Lab",
        "dueDate": "2026-10-01T23:59:59.000Z",
        "submissionStatus": "CONFIRMED",
        "confirmedByName": "Alice Smith",
        "confirmedAt": "2026-09-15T12:26:04.746Z"
      }
    ],
    "progress": {
      "totalAssigned": 1,
      "completedAssignments": 1,
      "pendingAssignments": 0,
      "progressPercentage": 100
    }
  }
}
```

---

### 7.5 Admin Assignment-Wise Submission Monitoring
- **URL**: `GET /api/admin/submissions/assignment/:assignmentId`
- **Access**: `ADMIN` role only
- **Description**: Returns all groups allocated to the assignment and their completion status.
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "data": {
    "assignment": { "id": "...", "title": "...", "due_date": "..." },
    "assignedGroupsCount": 5,
    "confirmedGroupsCount": 3,
    "pendingGroupsCount": 2,
    "completionPercentage": 60,
    "groups": [ ... ]
  }
}
```

---

### 7.6 Admin Student-Wise Submission Confirmation Tracking
- **URL**: `GET /api/admin/submissions/student-wise`
- **Access**: `ADMIN` role only
- **Query Parameters**:
  - `assignmentId` *(optional UUID)*
  - `groupId` *(optional UUID)*
  - `search` *(optional string)*: Filters by student name, code, email, group name, or assignment title
- **Description**: Tracks individual student confirmation status across all assigned coursework. Accurately distinguishes between the student who personally confirmed (`isConfirmer: true`) and teammates covered by the group submission (`isConfirmer: false`, `confirmedByName: "..."`).
- **Response Status**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "data": {
    "total": 24,
    "records": [
      {
        "studentId": "b0000000-0000-0000-0000-000000000001",
        "studentName": "Alice Smith",
        "studentCode": "STU2026001",
        "studentEmail": "alice.smith@university.edu",
        "groupId": "1b4d034f-fdf1-42c2-9c53-616d0eb72b46",
        "groupName": "Team Alpha",
        "assignmentId": "a4006dbe-1c16-49c6-be33-f552f55d6979",
        "assignmentTitle": "Raft Consensus Lab",
        "assignmentDueDate": "2026-10-01T23:59:59.000Z",
        "groupSubmissionStatus": "CONFIRMED",
        "isConfirmer": true,
        "confirmedByName": "Alice Smith",
        "confirmedAt": "2026-09-15T12:26:04.746Z"
      },
      {
        "studentId": "b0000000-0000-0000-0000-000000000002",
        "studentName": "Bob Jones",
        "studentCode": "STU2026002",
        "studentEmail": "bob.jones@university.edu",
        "groupId": "1b4d034f-fdf1-42c2-9c53-616d0eb72b46",
        "groupName": "Team Alpha",
        "assignmentId": "a4006dbe-1c16-49c6-be33-f552f55d6979",
        "assignmentTitle": "Raft Consensus Lab",
        "assignmentDueDate": "2026-10-01T23:59:59.000Z",
        "groupSubmissionStatus": "CONFIRMED",
        "isConfirmer": false,
        "confirmedByName": "Alice Smith",
        "confirmedAt": "2026-09-15T12:26:04.746Z"
      }
    ]
  }
}
```

