-- =============================================================
-- Seed Data: 001_seed_initial_data.sql
-- Description: Development seed data with Admins, Students, Groups,
--              Memberships, Assignments, Group Mappings, Submissions.
-- Phase: 2 (Data Modeling & Architecture)
-- Password for all seed users: Password123!
-- Bcrypt Hash: $2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2
-- =============================================================

-- Clean up existing data in reverse order of foreign key dependencies
DELETE FROM submissions;
DELETE FROM assignment_groups;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_students') THEN
        EXECUTE 'DELETE FROM course_students';
    END IF;
END $$;
DELETE FROM assignments;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        EXECUTE 'DELETE FROM courses';
    END IF;
END $$;
DELETE FROM group_members;
DELETE FROM groups;
DELETE FROM users;

-- -------------------------------------------------------------
-- 1. SEED USERS (Admins & Students)
-- -------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, student_id) VALUES
-- Admin / Professor Accounts
('a0000000-0000-0000-0000-000000000001', 'Dr. Alan Turing', 'dr.alan@university.edu', '$2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2', 'ADMIN', NULL),
('a0000000-0000-0000-0000-000000000002', 'Prof. Sarah Connor', 'prof.sarah@university.edu', '$2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2', 'ADMIN', NULL),

-- Student Accounts
('b0000000-0000-0000-0000-000000000001', 'Alice Smith', 'alice.smith@university.edu', '$2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2', 'STUDENT', 'STU2026001'),
('b0000000-0000-0000-0000-000000000002', 'Bob Jones', 'bob.jones@university.edu', '$2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2', 'STUDENT', 'STU2026002'),
('b0000000-0000-0000-0000-000000000003', 'Charlie Brown', 'charlie.brown@university.edu', '$2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2', 'STUDENT', 'STU2026003'),
('b0000000-0000-0000-0000-000000000004', 'Diana Prince', 'diana.prince@university.edu', '$2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2', 'STUDENT', 'STU2026004'),
('b0000000-0000-0000-0000-000000000005', 'Evan Wright', 'evan.wright@university.edu', '$2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2', 'STUDENT', 'STU2026005'),
('b0000000-0000-0000-0000-000000000006', 'Fiona Gallagher', 'fiona.gallagher@university.edu', '$2b$10$CYhBQYimpaMDqvDZb5GDnuld15L7AJprjD4QOyCbe83JQcr4xPSh2', 'STUDENT', 'STU2026006');

-- -------------------------------------------------------------
-- 2. SEED GROUPS
-- -------------------------------------------------------------
INSERT INTO groups (id, name, created_by) VALUES
('c0000000-0000-0000-0000-000000000001', 'Alpha Innovators', 'b0000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000002', 'Cloud Architects', 'b0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000003', 'Data Wizards', 'b0000000-0000-0000-0000-000000000005');

-- -------------------------------------------------------------
-- 3. SEED GROUP MEMBERS
-- -------------------------------------------------------------
INSERT INTO group_members (id, group_id, student_id) VALUES
-- Alpha Innovators: Alice Smith & Bob Jones
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),

-- Cloud Architects: Charlie Brown & Diana Prince
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004'),

-- Data Wizards: Evan Wright & Fiona Gallagher
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006');

-- -------------------------------------------------------------
-- 4. SEED ASSIGNMENTS
-- -------------------------------------------------------------
INSERT INTO assignments (id, title, description, due_date, onedrive_link, created_by) VALUES
('e0000000-0000-0000-0000-000000000001', 'CS401: Distributed Consensus Implementation', 'Implement Paxos or Raft algorithm in Go/Node.js. Submit code archive and PDF report to OneDrive.', CURRENT_TIMESTAMP + INTERVAL '7 days', 'https://onedrive.live.com/academic/cs401-consensus-lab', 'a0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000002', 'CS402: Cloud Architecture & High Availability', 'Design a scalable multi-tier web application architecture with automated failover and terraform scripts.', CURRENT_TIMESTAMP + INTERVAL '14 days', 'https://onedrive.live.com/academic/cs402-cloud-ha-project', 'a0000000-0000-0000-0000-000000000002'),
('e0000000-0000-0000-0000-000000000003', 'CS403: Relational Indexing & Query Tuning', 'Analyze slow query logs, optimize schema indexes, and demonstrate 10x throughput improvement.', CURRENT_TIMESTAMP + INTERVAL '21 days', 'https://onedrive.live.com/academic/cs403-db-indexing-opt', 'a0000000-0000-0000-0000-000000000001');

-- -------------------------------------------------------------
-- 5. SEED ASSIGNMENT GROUPS
-- -------------------------------------------------------------
INSERT INTO assignment_groups (id, assignment_id, group_id) VALUES
-- Assignment 1 assigned to Alpha Innovators & Cloud Architects
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'),

-- Assignment 2 assigned to Cloud Architects & Data Wizards
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003'),

-- Assignment 3 assigned to all 3 groups
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003');

-- -------------------------------------------------------------
-- 6. SEED SUBMISSIONS
-- -------------------------------------------------------------
INSERT INTO submissions (id, assignment_id, group_id, confirmed_by, confirmed_at, status) VALUES
-- Alpha Innovators confirmed Assignment 1
('10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '1 day', 'CONFIRMED'),

-- Cloud Architects pending Assignment 1
('10000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'PENDING'),

-- Cloud Architects confirmed Assignment 2
('10000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'CONFIRMED');
