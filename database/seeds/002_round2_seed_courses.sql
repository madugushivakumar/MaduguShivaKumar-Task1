-- =============================================================
-- Seed Data: 002_round2_seed_courses.sql
-- Description: Seeds Round 2 courses, student enrollments, links existing
--              assignments to courses, and seeds individual assignments/submissions.
-- Phase: Round 2 Evolution
-- =============================================================

-- -------------------------------------------------------------
-- 1. ADD PROFESSOR MARIE CURIE
-- -------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, student_id)
VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'Prof. Marie Curie',
    'prof.curie@university.edu',
    '$2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2',
    'PROFESSOR',
    NULL
)
ON CONFLICT (email) DO NOTHING;

-- -------------------------------------------------------------
-- 2. SEED COURSES
-- -------------------------------------------------------------
INSERT INTO courses (id, name, code, description, professor_id) VALUES
('11000000-0000-0000-0000-000000000001', 'Introduction to Computer Systems & Algorithms', 'CS101', 'Fundamental concepts in algorithmic complexity, computer architecture, memory models, and data structures.', 'a0000000-0000-0000-0000-000000000001'),
('11000000-0000-0000-0000-000000000002', 'Distributed Consensus & Fault-Tolerant Systems', 'CS401', 'Practical study of distributed agreement protocols, Raft, Paxos, replication state machines, and eventual consistency.', 'a0000000-0000-0000-0000-000000000001'),
('11000000-0000-0000-0000-000000000003', 'Cloud Computing & Scalable Microservices', 'CS402', 'Architectural patterns for high availability, containerization, Kubernetes orchestration, and disaster recovery.', 'a0000000-0000-0000-0000-000000000002'),
('11000000-0000-0000-0000-000000000004', 'Relational Database Design & Query Optimization', 'CS403', 'In-depth exploration of B-tree indexing, query planner cost models, concurrency isolation levels, and tuning in PostgreSQL.', 'a0000000-0000-0000-0000-000000000002')
ON CONFLICT (code) DO NOTHING;

-- -------------------------------------------------------------
-- 3. SEED COURSE ENROLLMENTS (course_students)
-- -------------------------------------------------------------
INSERT INTO course_students (course_id, student_id) VALUES
-- CS101: All Students enrolled
('11000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('11000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
('11000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003'),
('11000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004'),
('11000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005'),
('11000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006'),

-- CS401: Alice, Bob, Charlie, Diana
('11000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001'),
('11000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'),
('11000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003'),
('11000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004'),

-- CS402: Charlie, Diana, Evan, Fiona
('11000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'),
('11000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004'),
('11000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005'),
('11000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006'),

-- CS403: Alice, Bob, Evan, Fiona
('11000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001'),
('11000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002'),
('11000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005'),
('11000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006')
ON CONFLICT (course_id, student_id) DO NOTHING;

-- -------------------------------------------------------------
-- 4. LINK EXISTING ASSIGNMENTS TO COURSES
-- -------------------------------------------------------------
UPDATE assignments
SET course_id = '11000000-0000-0000-0000-000000000002', submission_type = 'GROUP'
WHERE id = 'e0000000-0000-0000-0000-000000000001';

UPDATE assignments
SET course_id = '11000000-0000-0000-0000-000000000003', submission_type = 'GROUP'
WHERE id = 'e0000000-0000-0000-0000-000000000002';

UPDATE assignments
SET course_id = '11000000-0000-0000-0000-000000000004', submission_type = 'GROUP'
WHERE id = 'e0000000-0000-0000-0000-000000000003';

-- -------------------------------------------------------------
-- 5. SEED INDIVIDUAL ASSIGNMENTS
-- -------------------------------------------------------------
INSERT INTO assignments (id, title, description, due_date, onedrive_link, created_by, course_id, submission_type)
VALUES
(
    'e0000000-0000-0000-0000-000000000004',
    'CS101: Algorithmic Complexity Analysis Essay',
    'Submit an individual 4-page academic analysis comparing quicksort vs mergesort cache locality in modern memory hierarchies.',
    CURRENT_TIMESTAMP + INTERVAL '10 days',
    'https://onedrive.live.com/academic/cs101-algo-essay',
    'a0000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000001',
    'INDIVIDUAL'
),
(
    'e0000000-0000-0000-0000-000000000005',
    'CS403: PostgreSQL Query Planner Execution Analysis',
    'Individual assignment: Profile EXPLAIN (ANALYZE, BUFFERS) outputs for three complex joins and propose schema index additions.',
    CURRENT_TIMESTAMP + INTERVAL '12 days',
    'https://onedrive.live.com/academic/cs403-query-opt-individual',
    'a0000000-0000-0000-0000-000000000002',
    '11000000-0000-0000-0000-000000000004',
    'INDIVIDUAL'
)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 6. UPDATE EXISTING GROUP SUBMISSIONS FOR ACKNOWLEDGMENT TRACKING
-- -------------------------------------------------------------
-- Alpha Innovators submission for Assignment 1 (created_by is Alice b000...001)
UPDATE submissions
SET is_acknowledged = TRUE,
    acknowledged_at = confirmed_at,
    acknowledged_by = confirmed_by,
    status = 'ACKNOWLEDGED'
WHERE assignment_id = 'e0000000-0000-0000-0000-000000000001'
  AND group_id = 'c0000000-0000-0000-0000-000000000001';

-- Cloud Architects submission for Assignment 2 (Charlie b000...003)
UPDATE submissions
SET is_acknowledged = TRUE,
    acknowledged_at = confirmed_at,
    acknowledged_by = confirmed_by,
    status = 'ACKNOWLEDGED'
WHERE assignment_id = 'e0000000-0000-0000-0000-000000000002'
  AND group_id = 'c0000000-0000-0000-0000-000000000002';

-- -------------------------------------------------------------
-- 7. SEED INDIVIDUAL SUBMISSIONS
-- -------------------------------------------------------------
INSERT INTO submissions (id, assignment_id, group_id, student_id, confirmed_by, confirmed_at, status, is_acknowledged, acknowledged_at, acknowledged_by, submission_link)
VALUES
-- Alice confirmed & acknowledged her CS101 essay
(
    '20000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000004',
    NULL,
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'ACKNOWLEDGED',
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'b0000000-0000-0000-0000-000000000001',
    'https://github.com/alice/cs101-algo-essay'
),
-- Bob submitted his CS101 essay (submitted, pending final acknowledgment)
(
    '20000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000004',
    NULL,
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    CURRENT_TIMESTAMP - INTERVAL '5 hours',
    'SUBMITTED',
    FALSE,
    NULL,
    NULL,
    'https://github.com/bob/cs101-algo-essay'
)
ON CONFLICT (id) DO NOTHING;
