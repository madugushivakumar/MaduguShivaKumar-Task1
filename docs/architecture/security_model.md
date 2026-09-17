# Joineazy Security Architecture & Threat Model

This document outlines the security controls, authentication mechanisms, authorization models, and vulnerability mitigations implemented across the platform.

---

## 1. Authentication & Password Security

- **Bcrypt Password Hashing**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with a work factor of 10 (`BCRYPT_SALT_ROUNDS = 10`), rendering brute-force and rainbow-table attacks computationally infeasible.
- **Hash Sanitization**: Password hashes are strictly stripped from all service DTOs and API responses (`AuthService.sanitizeUser`). Repositories explicitly omit `password_hash` in `SELECT` statements (`id, name, email, role, student_id, created_at, updated_at`).
- **Timing & Enumeration Defense**: Login endpoint returns a generic `"Invalid email or password."` error for both non-existent users and incorrect passwords, preventing user enumeration attacks.
- **No Password Logging**: Request logger middleware records only method, path, status, and duration; request bodies and credentials are never logged.

---

## 2. JWT Architecture & Session Security

- **Signing Algorithm**: JSON Web Tokens are cryptographically signed using HMAC-SHA256 (HS256) with a dedicated secret loaded from environment variables (`JWT_SECRET`).
- **Token Expiration**: Signed tokens carry a 7-day expiration (`JWT_EXPIRES_IN=7d`), balancing user experience with session revocation boundaries.
- **Minimal Payload Principle**: Payloads contain strictly identity and role references (`{ id, email, role }`); no sensitive institutional or personal data is embedded in the token.
- **Strict Verification Middleware** (`authenticateJWT`):
  - Validates `Authorization: Bearer <token>` header format.
  - Rejects expired tokens with `401 Unauthorized` (`TokenExpiredError`).
  - Rejects tampered, malformed, or altered signatures with `401 Unauthorized`.

---

## 3. Role-Based Access Control (RBAC)

The application enforces a dual-tier authorization matrix:

| Endpoint Resource | Public | STUDENT Role | ADMIN Role | Guard Mechanism |
|---|---|---|---|---|
| `POST /api/auth/register` | ✅ | ❌ | ❌ | Self-registration creates `STUDENT` only. Role tampering blocked. |
| `POST /api/auth/login` | ✅ | ✅ | ✅ | Issues signed JWT with verified user role. |
| `GET /api/auth/me` | ❌ | ✅ | ✅ | `authenticateJWT` |
| `POST /api/groups` | ❌ | ✅ | ❌ | `authorizeRoles('STUDENT')` |
| `GET /api/groups` | ❌ | ✅ (Enrolled) | ✅ (All) | Role-filtered in `group.service.js` |
| `GET /api/groups/:id` | ❌ | ✅ (Member only) | ✅ | Object-level membership check |
| `POST /api/groups/:id/members` | ❌ | ✅ (Member only) | ✅ | Object-level membership check |
| `DELETE /api/groups/:id/members/:studentId` | ❌ | ✅ (Creator/Self) | ✅ | Creator anchor check |
| `POST /api/assignments` | ❌ | ❌ | ✅ | `authorizeRoles('ADMIN')` |
| `PUT /api/assignments/:id` | ❌ | ❌ | ✅ | `authorizeRoles('ADMIN')` |
| `POST /api/assignments/:id/groups` | ❌ | ❌ | ✅ | `authorizeRoles('ADMIN')` |
| `DELETE /api/assignments/:id` | ❌ | ❌ | ✅ | `authorizeRoles('ADMIN')` |
| `GET /api/assignments/student` | ❌ | ✅ | ❌ | `authorizeRoles('STUDENT')` |
| `POST /api/submissions/confirm` | ❌ | ✅ (Member only) | ❌ | `authorizeRoles('STUDENT')` + group membership check |
| `GET /api/admin/*` | ❌ | ❌ | ✅ | `authorizeRoles('ADMIN')` |
| `GET /api/analytics/*` | ❌ | ❌ | ✅ | `authorizeRoles('ADMIN')` |

---

## 4. Object-Level Authorization Guardrails

Beyond endpoint role checking, the service layer enforces granular object-level boundaries:

1. **Student Group Isolation**:
   - A student cannot view private member rosters or coursework of another group they do not belong to.
   - Any attempt returns `403 Forbidden` (`"Access denied: You are not an authorized member of this group."`).
2. **Submission Confirmation Integrity**:
   - Confirmation is restricted to enrolled group members for assignments officially allocated to that group.
   - Non-members attempting to confirm receive `403 Forbidden`.
   - Submissions for unallocated assignments receive `400 Bad Request`.
3. **Group Creator Anchor Protection**:
   - The student who created a group cannot be removed from that group, preventing orphan groups or unauthorized ownership transfers.
4. **Coursework Scope Isolation**:
   - Students cannot view assignment details for assignments not allocated to their groups (`403 Forbidden`).

---

## 5. Input Validation & Parameter Sanitization

- **UUID Parameter Validation** (`validateUuidParams`):
  - Every route parameter (`:id`, `:studentId`, `:assignmentId`, `:groupId`) is pre-validated against standard UUID v4 regex (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`).
  - Malformed inputs are rejected immediately with `400 Bad Request`, preventing database syntax errors.
- **Length & Format Constraints**:
  - Name: $\ge 2$ characters.
  - Title: $3 \dots 255$ characters.
  - Group name: $2 \dots 100$ characters.
  - Due date: Strict ISO 8601 validation (`Date.parse`).
  - Email: Valid institutional regex pattern (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- **URL Protocol Whitelisting**:
  - External OneDrive links must strictly use `http:` or `https:`. Malicious schemes like `javascript:`, `data:`, or `ftp:` are rejected with `400 Bad Request`.

---

## 6. SQL Injection Defense

- **100% Parameterized Queries**: All database interactions in every repository use PostgreSQL parameter placeholders (`$1`, `$2`, `$3`).
- **Zero String Concatenation**: Untrusted user inputs are never concatenated or interpolated directly into SQL command strings.
- **Search Filters**: Full-text search filters use parameterized `ILIKE '%' || $1 || '%'` constructs safely.

---

## 7. Network, Transport & Error Hardening

- **Security Headers (Helmet)**: Express utilizes `helmet()` to configure secure HTTP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`, `X-XSS-Protection`).
- **Origin-Restricted CORS**:
  - In development: Allows local origins (`localhost`, `127.0.0.1`, `FRONTEND_URL`).
  - In production: Strictly locks origins to the configured `FRONTEND_URL`. Unapproved origins receive CORS errors.
- **Error Information Leakage Defense**:
  - Centralized error handler catches PostgreSQL database errors:
    - `23505` (unique violation) $\to$ `409 Conflict`.
    - `23503` (foreign key violation) $\to$ `400 Bad Request`.
    - `22P02` (invalid syntax) $\to$ `400 Bad Request`.
  - In production, internal server errors ($500$) omit database query details and stack traces, returning `"An unexpected internal server error occurred."`.
