# Joineazy Database Architecture & Migration Guide

This directory houses the PostgreSQL schema migrations, development seed data, CLI test utilities, and data access repositories for the **Joineazy Student, Group & Assignment Management System**.

---

## 1. Directory Structure

```
database/
├── migrations/
│   ├── 001_foundation_setup.sql        # Initial setup: schema_migrations and UUID extensions
│   └── 002_create_business_schema.sql  # Complete relational schema (users, groups, assignments, etc.)
├── seeds/
│   └── 001_seed_initial_data.sql       # Test development data (Admins, Students, Groups, Submissions)
├── init-db.js                          # Database creator utility (creates joineazy_db if missing)
├── test-connection.js                  # Standalone CLI connection test utility
├── migrate.js                          # Programmatic migration runner with transaction safety
├── seed.js                             # Programmatic seed runner
├── verify-schema.js                    # Automated schema, constraints & repository test suite
└── README.md                           # Database documentation
```

---

## 2. Configuration & Environment Variables

PostgreSQL connection settings are loaded from `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/joineazy_db
```

| Parameter | Default (Local) | Default (Docker) | Description |
|---|---|---|---|
| User | `postgres` | `postgres` | Database superuser/role |
| Password | `postgres` (or local) | `postgres` | Role authentication password |
| Host | `localhost` | `postgres` | Service network address |
| Port | `5432` | `5432` | PostgreSQL listening port |
| Database | `joineazy_db` | `joineazy_db` | Primary application database |

---

## 3. Database Commands

All commands can be executed from the project root:

```bash
# 1. Test Database Connectivity
npm run db:test

# 2. Run All Pending Schema Migrations
npm run db:migrate

# 3. Seed Database with Development Data
npm run db:seed

# 4. Run Complete Schema, Constraints & Repository Verification Suite
npm run db:verify
```

---

## 4. Schema Migrations Architecture

Migrations represent version-controlled, repeatable DDL operations:
- Every migration is placed in `database/migrations/` prefixed by a sequence number: `NNN_name.sql`.
- When running `npm run db:migrate`, the runner:
  1. Verifies the `schema_migrations` tracking table exists.
  2. Queries already-applied migrations.
  3. Executes unapplied migrations within an atomic `BEGIN ... COMMIT` transaction.
  4. Records successful migrations in `schema_migrations`.
  5. Skips previously applied migrations on subsequent runs (idempotent).

### Migration History
1. `001_foundation_setup.sql`: Enables `uuid-ossp` and `pgcrypto` extensions, creates `schema_migrations` tracking table.
2. `002_create_business_schema.sql`: Creates `users`, `groups`, `group_members`, `assignments`, `assignment_groups`, `submissions`, triggers for `updated_at`, foreign key cascades, and unique constraints.

---

## 5. Development Seed Data

Running `npm run db:seed` provisions realistic test data:

- **Admins / Professors**:
  - `dr.alan@university.edu` (Dr. Alan Turing)
  - `prof.sarah@university.edu` (Prof. Sarah Connor)
- **Students**:
  - `alice.smith@university.edu` (Alice Smith, ID: `STU2026001`)
  - `bob.jones@university.edu` (Bob Jones, ID: `STU2026002`)
  - `charlie.brown@university.edu` (Charlie Brown, ID: `STU2026003`)
  - `diana.prince@university.edu` (Diana Prince, ID: `STU2026004`)
  - `evan.wright@university.edu` (Evan Wright, ID: `STU2026005`)
  - `fiona.gallagher@university.edu` (Fiona Gallagher, ID: `STU2026006`)
- **Default Password for all seed users**: `Password123!`
  - Stored as bcrypt hash: `$2a$10$6Rz3G2p.w/7U619w0zP2xO8zVvI43hKj7hFpLpPzV8bK1w0yE3x0q`
- **Groups**:
  - `Alpha Innovators` (Members: Alice Smith, Bob Jones)
  - `Cloud Architects` (Members: Charlie Brown, Diana Prince)
  - `Data Wizards` (Members: Evan Wright, Fiona Gallagher)
- **Assignments**:
  - `CS401: Distributed Consensus Implementation`
  - `CS402: Cloud Architecture & High Availability`
  - `CS403: Relational Indexing & Query Tuning`
- **Submissions**: Sample `CONFIRMED` and `PENDING` states.

---

## 6. Reusable Data Access Layer (Repositories)

Located in `backend/src/repositories/`:

- **`UserRepository`** (`user.repository.js`):
  - `findByEmail(email)`
  - `findById(id)`
  - `findByStudentId(studentId)`
  - `create({ name, email, passwordHash, role, studentId })`
  - `listByRole(role)`
- **`GroupRepository`** (`group.repository.js`):
  - `create({ name, createdBy })`
  - `findById(id)`
  - `addMember({ groupId, studentId })`
  - `removeMember({ groupId, studentId })`
  - `listMembers(groupId)`
  - `listGroupsForStudent(studentId)`
  - `listAll()`
- **`AssignmentRepository`** (`assignment.repository.js`):
  - `create({ title, description, dueDate, onedriveLink, createdBy })`
  - `findById(id)`
  - `update(id, updates)`
  - `assignToGroup({ assignmentId, groupId })`
  - `findAssignmentsForGroup(groupId)`
  - `listAll()`
- **`SubmissionRepository`** (`submission.repository.js`):
  - `upsertSubmission({ assignmentId, groupId, confirmedBy, status })`
  - `findByAssignmentAndGroup({ assignmentId, groupId })`
  - `listByGroup(groupId)`
  - `listByAssignment(assignmentId)`
  - `calculateGroupCompletion(groupId)`
