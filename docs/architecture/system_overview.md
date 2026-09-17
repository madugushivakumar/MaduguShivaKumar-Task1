# Joineazy System Architecture Overview

## 1. High-Level Enterprise Architecture

The Joineazy Academic Management System is structured as a modern decoupled full-stack platform consisting of a React Single Page Application (SPA), a layered Express.js REST API, and a relational PostgreSQL database.

```mermaid
graph TD
    subgraph Client Layer [Web Presentation Tier]
        SPA[React 18 SPA + Vite<br/>Tailwind CSS v3<br/>Port 5173 / Port 3000 in Docker]
        AuthCtx[AuthContext / Token Storage]
        SPA --> AuthCtx
    end

    subgraph Security & Edge [Transport & Perimeter Security]
        CORS[CORS Policy Guard]
        Helmet[Helmet HTTP Security Headers]
        JWTGuard[JWT Verification & Role Middleware]
    end

    subgraph Backend Layer [Express REST Application Tier - Port 5000]
        Router[API Gateway Router: /api]
        Controllers[Controller Layer: HTTP & Status Codes]
        Validators[Validator Layer: Param & Body Guards]
        Services[Service Layer: Domain Business Invariants]
        Repositories[Repository Layer: SQL Data Access Object]
        ErrHandler[Centralized Error Handler]
    end

    subgraph Persistence Layer [PostgreSQL 16 Relational Engine - Port 5432]
        DB[(PostgreSQL 16 Engine)]
        Pool[pg.Pool Connection Manager]
        Schema[Relational Tables & Foreign Keys]
        Indexes[B-Tree Indexes & Constraints]
    end

    SPA -->|HTTPS / JSON API Requests| CORS
    CORS --> Helmet
    Helmet --> Router
    Router --> Validators
    Validators --> JWTGuard
    JWTGuard --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> Pool
    Pool --> DB
    DB --> Schema
    Schema --> Indexes
    Controllers -.->|Catches Exceptions| ErrHandler
    ErrHandler -.->|Normalized JSON Error| SPA
```

---

## 2. Backend Layered Architecture

To guarantee separation of concerns, testability, and maintainability, the backend enforces a strict **6-tier layered design**:

```mermaid
sequenceDiagram
    autonumber
    participant C as Web Client (Axios / Browser)
    participant R as Routes Layer (/api/...)
    participant V as Validation Layer (*.validator.js)
    participant A as Auth & RBAC Guard (auth.middleware.js)
    participant CTL as Controller Layer (*.controller.js)
    participant S as Service Layer (*.service.js)
    participant REP as Repository Layer (*.repository.js)
    participant DB as PostgreSQL 16 Database

    C->>R: HTTP Request (Method + Path + Body/Headers)
    R->>V: Pass payload to Schema Validator
    alt Malformed Input (e.g. invalid UUID, empty field)
        V-->>C: 400 Bad Request { success: false, message: ... }
    end
    V->>A: Forward validated input
    alt Missing or Invalid Token
        A-->>C: 401 Unauthorized { success: false, message: ... }
    else Role Forbidden (e.g. Student calling Admin endpoint)
        A-->>C: 403 Forbidden { success: false, message: ... }
    end
    A->>CTL: Forward authenticated request (req.user attached)
    CTL->>S: Invoke domain service method
    S->>S: Enforce business domain invariants & object authorization
    alt Object Unauthorized (e.g. Student not in target group)
        S-->>C: 403 Forbidden { success: false, message: ... }
    end
    S->>REP: Invoke data access method
    REP->>DB: Parameterized SQL Query ($1, $2, ...)
    DB-->>REP: Raw database rows
    REP-->>S: Domain objects / DTOs
    S-->>CTL: Sanitized service results (passwords stripped)
    CTL-->>C: 200 OK / 201 Created { success: true, data: ... }
```

### Layer Responsibilities

| Tier | Directory | Responsibilities |
|---|---|---|
| **Routes** | `backend/src/routes/` | Declares URL routing tree, HTTP verbs, and mounts middleware chains. |
| **Validators** | `backend/src/validators/` | Sanitizes strings, validates UUID parameters, checks field lengths, enforces URL schemas. |
| **Middleware** | `backend/src/middleware/` | JWT token decoding, role-based authorization guards, structured HTTP logging, centralized error handling. |
| **Controllers** | `backend/src/controllers/` | Translates HTTP requests into service calls, maps status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`), returns uniform JSON. |
| **Services** | `backend/src/services/` | Encapsulates business logic, data sanitization (stripping password hashes), object-level authorization, and workflow orchestration. |
| **Repositories** | `backend/src/repositories/` | Direct data-access abstraction layer executing parameterized SQL queries against the PostgreSQL connection pool. |

---

## 3. Relational Database Schema & ER Diagram

The database utilizes standard relational normalization with strict foreign key constraints, unique constraints, and B-Tree indexes:

```mermaid
erDiagram
    users ||--o{ groups : "creates"
    users ||--o{ group_members : "belongs to"
    users ||--o{ assignments : "authors"
    users ||--o{ submissions : "confirms"
    groups ||--o{ group_members : "contains"
    groups ||--o{ assignment_groups : "allocated"
    groups ||--o{ submissions : "delivers"
    assignments ||--o{ assignment_groups : "mapped to"
    assignments ||--o{ submissions : "target of"

    users {
        UUID id PK "gen_random_uuid()"
        VARCHAR name "NOT NULL"
        VARCHAR email "UNIQUE NOT NULL"
        VARCHAR password_hash "NOT NULL (Bcrypt 10 rounds)"
        VARCHAR role "CHECK: STUDENT, ADMIN"
        VARCHAR student_id "UNIQUE (required for STUDENT)"
        TIMESTAMPTZ created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ updated_at "DEFAULT CURRENT_TIMESTAMP"
    }

    groups {
        UUID id PK "gen_random_uuid()"
        VARCHAR name "NOT NULL"
        UUID created_by FK "REFERENCES users(id)"
        TIMESTAMPTZ created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ updated_at "DEFAULT CURRENT_TIMESTAMP"
    }

    group_members {
        UUID id PK "gen_random_uuid()"
        UUID group_id FK "REFERENCES groups(id) ON DELETE CASCADE"
        UUID student_id FK "REFERENCES users(id) ON DELETE CASCADE"
        TIMESTAMPTZ joined_at "DEFAULT CURRENT_TIMESTAMP"
    }

    assignments {
        UUID id PK "gen_random_uuid()"
        VARCHAR title "NOT NULL"
        TEXT description "Nullable"
        TIMESTAMPTZ due_date "NOT NULL"
        TEXT onedrive_link "NOT NULL (HTTP/HTTPS)"
        UUID created_by FK "REFERENCES users(id)"
        TIMESTAMPTZ created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ updated_at "DEFAULT CURRENT_TIMESTAMP"
    }

    assignment_groups {
        UUID id PK "gen_random_uuid()"
        UUID assignment_id FK "REFERENCES assignments(id) ON DELETE CASCADE"
        UUID group_id FK "REFERENCES groups(id) ON DELETE CASCADE"
        TIMESTAMPTZ assigned_at "DEFAULT CURRENT_TIMESTAMP"
    }

    submissions {
        UUID id PK "gen_random_uuid()"
        UUID assignment_id FK "REFERENCES assignments(id) ON DELETE CASCADE"
        UUID group_id FK "REFERENCES groups(id) ON DELETE CASCADE"
        UUID confirmed_by FK "REFERENCES users(id)"
        TIMESTAMPTZ confirmed_at "DEFAULT CURRENT_TIMESTAMP"
        VARCHAR status "CHECK: PENDING, CONFIRMED"
        TIMESTAMPTZ created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ updated_at "DEFAULT CURRENT_TIMESTAMP"
    }
```

---

## 4. Frontend Architecture

- **SPA Foundation**: React 18 + Vite 5 + Tailwind CSS v3 with responsive UI components.
- **Client Routing**: `react-router-dom` v6 with declarative `<ProtectedRoute allowedRoles={...}>` wrapping role-gated routes.
- **State Management**:
  - `AuthContext`: Centralized authentication provider managing JWT persistence in `localStorage`, user session state, and automated authorization header injection.
  - Page-level and component-level reactive hooks (`useState`, `useEffect`, `useCallback`) for real-time dashboards and charts.
- **Data Visualization**: Pure responsive SVG charts (Donut Chart for submission status, Horizontal Bar charts for assignment completion and group ranking) ensuring zero external charting bloat, high rendering performance, and complete responsiveness across mobile, tablet, and desktop breakpoints.
