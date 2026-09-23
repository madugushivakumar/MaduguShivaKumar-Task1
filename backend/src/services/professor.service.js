const { query } = require('../config/db.config');
const courseRepository = require('../repositories/course.repository');
const assignmentRepository = require('../repositories/assignment.repository');
const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class ProfessorService {
  /**
   * Aggregate complete dashboard metrics for a professor
   * @param {string} professorId
   * @returns {Promise<object>}
   */
  async getProfessorDashboard(professorId) {
    // 1. Fetch courses taught by this professor
    const courses = await courseRepository.listByProfessor(professorId);
    const courseIds = courses.map((c) => c.id);

    // 2. Total unique students enrolled in professor's courses
    let totalStudents = 0;
    if (courseIds.length > 0) {
      const studentRes = await query(
        `SELECT COUNT(DISTINCT student_id)::int AS total_students
         FROM course_students
         WHERE course_id = ANY($1::uuid[])`,
        [courseIds]
      );
      totalStudents = studentRes.rows[0].total_students || 0;
    } else {
      // Fallback to all students in system if professor has no courses yet
      const fallbackRes = await query(`SELECT COUNT(*)::int AS total_students FROM users WHERE role = 'STUDENT'`);
      totalStudents = fallbackRes.rows[0].total_students || 0;
    }

    // 3. Total assignments created by professor or in their courses
    const assignmentsRes = await query(
      `SELECT a.id, a.title, a.due_date, a.course_id, a.submission_type,
              c.name AS course_name, c.code AS course_code
       FROM assignments a
       LEFT JOIN courses c ON a.course_id = c.id
       WHERE a.created_by = $1 OR ($2::uuid[] IS NOT NULL AND a.course_id = ANY($2::uuid[]))
       ORDER BY a.created_at DESC`,
      [professorId, courseIds.length > 0 ? courseIds : null]
    );
    const assignments = assignmentsRes.rows;
    const assignmentIds = assignments.map((a) => a.id);

    // 4. Submissions statistics across these assignments
    let submittedCount = 0;
    let acknowledgedCount = 0;
    let totalPossible = 0;

    if (assignmentIds.length > 0) {
      const subRes = await query(
        `SELECT 
           COUNT(*)::int AS total_submissions,
           COUNT(*) FILTER (WHERE status = 'ACKNOWLEDGED' OR is_acknowledged = TRUE)::int AS acknowledged_count,
           COUNT(*) FILTER (WHERE status IN ('SUBMITTED', 'CONFIRMED', 'ACKNOWLEDGED'))::int AS submitted_count
         FROM submissions
         WHERE assignment_id = ANY($1::uuid[])`,
        [assignmentIds]
      );
      submittedCount = subRes.rows[0].submitted_count || 0;
      acknowledgedCount = subRes.rows[0].acknowledged_count || 0;

      // Calculate total expected target submissions (sum of enrolled students for individual + groups for group assignments)
      const expectedRes = await query(
        `SELECT
           (
             SELECT COUNT(*)::int
             FROM assignment_groups ag
             WHERE ag.assignment_id = ANY($1::uuid[])
           ) AS group_targets,
           (
             SELECT COUNT(*)::int
             FROM assignments a
             JOIN course_students cs ON a.course_id = cs.course_id
             WHERE a.id = ANY($1::uuid[]) AND a.submission_type = 'INDIVIDUAL'
           ) AS individual_targets`,
        [assignmentIds]
      );
      const groupTargets = expectedRes.rows[0].group_targets || 0;
      const individualTargets = expectedRes.rows[0].individual_targets || 0;
      totalPossible = groupTargets + individualTargets;
    }

    const pendingCount = Math.max(0, totalPossible - submittedCount);
    const submissionRate = totalPossible > 0 ? Math.round((submittedCount / totalPossible) * 100) : 0;
    const acknowledgmentRate = submittedCount > 0 ? Math.round((acknowledgedCount / submittedCount) * 100) : 0;

    // 5. Per-course submission statistics
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const statsRes = await query(
          `SELECT 
             COUNT(DISTINCT a.id)::int AS course_assignments,
             COUNT(s.id) FILTER (WHERE s.status IN ('SUBMITTED', 'CONFIRMED', 'ACKNOWLEDGED'))::int AS course_submissions,
             COUNT(s.id) FILTER (WHERE s.status = 'ACKNOWLEDGED' OR s.is_acknowledged = TRUE)::int AS course_acknowledged
           FROM assignments a
           LEFT JOIN submissions s ON a.id = s.assignment_id
           WHERE a.course_id = $1`,
          [course.id]
        );
        const row = statsRes.rows[0];
        const studentCount = parseInt(course.student_count, 10) || 0;
        const assignmentCount = parseInt(row.course_assignments, 10) || 0;
        const totalTarget = studentCount * assignmentCount;
        const cSubmissions = parseInt(row.course_submissions, 10) || 0;
        const cRate = totalTarget > 0 ? Math.min(100, Math.round((cSubmissions / totalTarget) * 100)) : 0;

        return {
          ...course,
          student_count: studentCount,
          assignment_count: assignmentCount,
          submitted_count: cSubmissions,
          acknowledged_count: parseInt(row.course_acknowledged, 10) || 0,
          submission_rate: cRate,
        };
      })
    );

    // 6. Recent submission activity
    let recentSubmissions = [];
    if (assignmentIds.length > 0) {
      const recentRes = await query(
        `SELECT s.id, s.assignment_id, s.status, s.is_acknowledged, s.confirmed_at, s.submission_link,
                a.title AS assignment_title, a.due_date, a.submission_type,
                c.code AS course_code, c.name AS course_name,
                COALESCE(g.name, stu.name) AS submitted_by_name,
                stu.student_id AS institutional_id
         FROM submissions s
         JOIN assignments a ON s.assignment_id = a.id
         LEFT JOIN courses c ON a.course_id = c.id
         LEFT JOIN groups g ON s.group_id = g.id
         LEFT JOIN users stu ON s.student_id = stu.id OR s.confirmed_by = stu.id
         WHERE s.assignment_id = ANY($1::uuid[])
         ORDER BY s.confirmed_at DESC
         LIMIT 10`,
        [assignmentIds]
      );
      recentSubmissions = recentRes.rows;
    }

    return {
      totalCourses: courses.length,
      totalStudents,
      totalAssignments: assignments.length,
      totalPossible,
      submittedCount,
      pendingCount,
      acknowledgedCount,
      submissionRate,
      acknowledgmentRate,
      courses: coursesWithStats,
      recentSubmissions,
    };
  }

  /**
   * Course-level analytics
   * @param {string} courseId
   * @returns {Promise<object>}
   */
  async getCourseAnalytics(courseId) {
    const course = await courseRepository.findByIdWithDetails(courseId);
    if (!course) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found.');
    }

    const assignmentsRes = await query(
      `SELECT a.id, a.title, a.due_date, a.submission_type,
              COUNT(s.id) FILTER (WHERE s.status IN ('SUBMITTED', 'CONFIRMED', 'ACKNOWLEDGED'))::int AS submitted_count,
              COUNT(s.id) FILTER (WHERE s.status = 'ACKNOWLEDGED' OR s.is_acknowledged = TRUE)::int AS acknowledged_count
       FROM assignments a
       LEFT JOIN submissions s ON a.id = s.assignment_id
       WHERE a.course_id = $1
       GROUP BY a.id, a.title, a.due_date, a.submission_type
       ORDER BY a.due_date ASC`,
      [courseId]
    );

    return {
      courseId,
      courseName: course.name,
      courseCode: course.code,
      studentCount: course.student_count,
      assignments: assignmentsRes.rows,
    };
  }

  /**
   * Assignment-level progress
   * @param {string} assignmentId
   * @returns {Promise<object>}
   */
  async getAssignmentProgress(assignmentId) {
    const assignment = await assignmentRepository.findByIdWithDetails(assignmentId);
    if (!assignment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    const subRes = await query(
      `SELECT 
         COUNT(*)::int AS total_submissions,
         COUNT(*) FILTER (WHERE status IN ('SUBMITTED', 'CONFIRMED', 'ACKNOWLEDGED'))::int AS submitted_count,
         COUNT(*) FILTER (WHERE status = 'ACKNOWLEDGED' OR is_acknowledged = TRUE)::int AS acknowledged_count
       FROM submissions
       WHERE assignment_id = $1`,
      [assignmentId]
    );

    const submitted = subRes.rows[0].submitted_count || 0;
    const acknowledged = subRes.rows[0].acknowledged_count || 0;
    const totalAssigned = assignment.assigned_groups_count || 1;
    const pending = Math.max(0, totalAssigned - submitted);
    const submissionRate = totalAssigned > 0 ? Math.min(100, Math.round((submitted / totalAssigned) * 100)) : 0;

    return {
      assignmentId,
      title: assignment.title,
      dueDate: assignment.due_date,
      submissionType: assignment.submission_type,
      totalAssigned,
      submitted,
      pending,
      acknowledged,
      submissionRate,
    };
  }
}

module.exports = new ProfessorService();
