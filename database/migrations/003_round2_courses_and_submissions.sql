-- =============================================================
-- Migration: 003_round2_courses_and_submissions.sql
-- Description: Establishes Round 2 architecture:
--              1. Support 'PROFESSOR' role in users table.
--              2. Creates Courses table and Course Students (Enrollments) table.
--              3. Links Assignments to Courses and adds submission_type (INDIVIDUAL / GROUP).
--              4. Enhances Submissions to support Individual submissions,
--                 Leader Acknowledgment tracking, and updated status values.
-- Phase: Round 2 Evolution
-- =============================================================

-- -------------------------------------------------------------
-- 1. ENHANCE USERS TABLE FOR PROFESSOR ROLE
-- -------------------------------------------------------------
DO $$
BEGIN
    -- Drop old role check constraint if present
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role;
    ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('STUDENT', 'ADMIN', 'PROFESSOR'));

    -- Update student_id constraint to allow NULL for PROFESSOR as well as ADMIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_student_id_for_role;
    ALTER TABLE users ADD CONSTRAINT chk_student_id_for_role CHECK (
        (role = 'STUDENT' AND student_id IS NOT NULL) OR
        (role IN ('ADMIN', 'PROFESSOR'))
    );
END $$;

-- -------------------------------------------------------------
-- 2. CREATE COURSES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    professor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_professor_id ON courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);

DROP TRIGGER IF EXISTS set_timestamp_courses ON courses;
CREATE TRIGGER set_timestamp_courses
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- -------------------------------------------------------------
-- 3. CREATE COURSE STUDENTS (ENROLLMENT) TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_course_student UNIQUE (course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_course_students_course_id ON course_students(course_id);
CREATE INDEX IF NOT EXISTS idx_course_students_student_id ON course_students(student_id);

-- -------------------------------------------------------------
-- 4. ENHANCE ASSIGNMENTS TABLE
-- -------------------------------------------------------------
DO $$
BEGIN
    -- Add course_id foreign key if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'assignments' AND column_name = 'course_id'
    ) THEN
        ALTER TABLE assignments ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
    END IF;

    -- Add submission_type column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'assignments' AND column_name = 'submission_type'
    ) THEN
        ALTER TABLE assignments ADD COLUMN submission_type VARCHAR(20) NOT NULL DEFAULT 'GROUP';
        ALTER TABLE assignments ADD CONSTRAINT chk_assignment_submission_type CHECK (submission_type IN ('INDIVIDUAL', 'GROUP'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_submission_type ON assignments(submission_type);

-- -------------------------------------------------------------
-- 5. ENHANCE SUBMISSIONS TABLE
-- -------------------------------------------------------------
DO $$
BEGIN
    -- Allow group_id to be NULL for individual submissions
    ALTER TABLE submissions ALTER COLUMN group_id DROP NOT NULL;

    -- Add student_id for individual submissions
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'submissions' AND column_name = 'student_id'
    ) THEN
        ALTER TABLE submissions ADD COLUMN student_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- Add acknowledgment tracking fields
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'submissions' AND column_name = 'is_acknowledged'
    ) THEN
        ALTER TABLE submissions ADD COLUMN is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'submissions' AND column_name = 'acknowledged_at'
    ) THEN
        ALTER TABLE submissions ADD COLUMN acknowledged_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'submissions' AND column_name = 'acknowledged_by'
    ) THEN
        ALTER TABLE submissions ADD COLUMN acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'submissions' AND column_name = 'submission_link'
    ) THEN
        ALTER TABLE submissions ADD COLUMN submission_link TEXT;
    END IF;

    -- Update submission status constraint
    ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
    ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_status;
    ALTER TABLE submissions ADD CONSTRAINT chk_submissions_status CHECK (
        status IN ('PENDING', 'SUBMITTED', 'ACKNOWLEDGED', 'CONFIRMED')
    );

    -- Ensure either group_id or student_id is provided
    ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submission_target;
    ALTER TABLE submissions ADD CONSTRAINT chk_submission_target CHECK (
        (group_id IS NOT NULL) OR (student_id IS NOT NULL)
    );
END $$;

CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_is_acknowledged ON submissions(is_acknowledged);

-- Create partial unique index for individual assignments
CREATE UNIQUE INDEX IF NOT EXISTS uq_submissions_assignment_student
ON submissions (assignment_id, student_id)
WHERE student_id IS NOT NULL;
