const { query } = require('../config/db.config');

class SubmissionRepository {
  /**
   * Create or update (upsert) an assignment submission record (Group or Individual)
   * @param {object} param0
   * @param {string} param0.assignmentId
   * @param {string} [param0.groupId]
   * @param {string} [param0.studentId]
   * @param {string} param0.confirmedBy - UUID of submitting/confirming student
   * @param {string} [param0.status='CONFIRMED']
   * @param {boolean} [param0.isAcknowledged=false]
   * @param {string} [param0.acknowledgedBy]
   * @param {string} [param0.submissionLink]
   * @returns {Promise<object>}
   */
  async upsertSubmission({
    assignmentId,
    groupId = null,
    studentId = null,
    confirmedBy,
    status = 'CONFIRMED',
    isAcknowledged = false,
    acknowledgedBy = null,
    submissionLink = null,
  }) {
    if (groupId) {
      const res = await query(
        `INSERT INTO submissions (assignment_id, group_id, student_id, confirmed_by, confirmed_at, status, is_acknowledged, acknowledged_at, acknowledged_by, submission_link)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, CASE WHEN $6 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END, $7, $8)
         ON CONFLICT (assignment_id, group_id)
         DO UPDATE SET
           confirmed_by = EXCLUDED.confirmed_by,
           confirmed_at = CURRENT_TIMESTAMP,
           status = EXCLUDED.status,
           is_acknowledged = EXCLUDED.is_acknowledged,
           acknowledged_at = CASE WHEN EXCLUDED.is_acknowledged = TRUE THEN CURRENT_TIMESTAMP ELSE submissions.acknowledged_at END,
           acknowledged_by = COALESCE(EXCLUDED.acknowledged_by, submissions.acknowledged_by),
           submission_link = COALESCE(EXCLUDED.submission_link, submissions.submission_link),
           updated_at = CURRENT_TIMESTAMP
         RETURNING id, assignment_id, group_id, student_id, confirmed_by, confirmed_at, status, is_acknowledged, acknowledged_at, acknowledged_by, submission_link, created_at, updated_at`,
        [assignmentId, groupId, studentId, confirmedBy, status, isAcknowledged, acknowledgedBy, submissionLink]
      );
      return res.rows[0];
    } else {
      // Individual submission
      const existing = await query(
        `SELECT id FROM submissions WHERE assignment_id = $1 AND student_id = $2`,
        [assignmentId, studentId]
      );

      if (existing.rows.length > 0) {
        const res = await query(
          `UPDATE submissions
           SET confirmed_by = $1,
               confirmed_at = CURRENT_TIMESTAMP,
               status = $2,
               is_acknowledged = $3,
               acknowledged_at = CASE WHEN $3 = TRUE THEN CURRENT_TIMESTAMP ELSE acknowledged_at END,
               acknowledged_by = COALESCE($4, acknowledged_by),
               submission_link = COALESCE($5, submission_link),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $6
           RETURNING id, assignment_id, group_id, student_id, confirmed_by, confirmed_at, status, is_acknowledged, acknowledged_at, acknowledged_by, submission_link, created_at, updated_at`,
          [confirmedBy, status, isAcknowledged, acknowledgedBy, submissionLink, existing.rows[0].id]
        );
        return res.rows[0];
      } else {
        const res = await query(
          `INSERT INTO submissions (assignment_id, group_id, student_id, confirmed_by, confirmed_at, status, is_acknowledged, acknowledged_at, acknowledged_by, submission_link)
           VALUES ($1, NULL, $2, $3, CURRENT_TIMESTAMP, $4, $5, CASE WHEN $5 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END, $6, $7)
           RETURNING id, assignment_id, group_id, student_id, confirmed_by, confirmed_at, status, is_acknowledged, acknowledged_at, acknowledged_by, submission_link, created_at, updated_at`,
          [assignmentId, studentId, confirmedBy, status, isAcknowledged, acknowledgedBy, submissionLink]
        );
        return res.rows[0];
      }
    }
  }

  /**
   * Find a submission for a specific assignment and group
   * @param {object} param0
   * @param {string} param0.assignmentId
   * @param {string} param0.groupId
   * @returns {Promise<object|null>}
   */
  async findByAssignmentAndGroup({ assignmentId, groupId }) {
    const res = await query(
      `SELECT s.id, s.assignment_id, s.group_id, s.confirmed_by, s.confirmed_at, s.status,
              s.is_acknowledged, s.acknowledged_at, s.acknowledged_by, s.submission_link,
              u.name AS confirmed_by_name, u.email AS confirmed_by_email,
              a.title AS assignment_title, a.onedrive_link
       FROM submissions s
       JOIN users u ON s.confirmed_by = u.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.assignment_id = $1 AND s.group_id = $2`,
      [assignmentId, groupId]
    );
    return res.rows[0] || null;
  }

  /**
   * Find an individual submission for an assignment and student
   * @param {object} param0
   * @param {string} param0.assignmentId
   * @param {string} param0.studentId
   * @returns {Promise<object|null>}
   */
  async findByAssignmentAndStudent({ assignmentId, studentId }) {
    const res = await query(
      `SELECT s.id, s.assignment_id, s.student_id, s.confirmed_by, s.confirmed_at, s.status,
              s.is_acknowledged, s.acknowledged_at, s.acknowledged_by, s.submission_link,
              u.name AS student_name, u.email AS student_email,
              a.title AS assignment_title, a.onedrive_link
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.assignment_id = $1 AND s.student_id = $2`,
      [assignmentId, studentId]
    );
    return res.rows[0] || null;
  }

  /**
   * List all submissions for a group
   * @param {string} groupId
   * @returns {Promise<Array>}
   */
  async listByGroup(groupId) {
    const res = await query(
      `SELECT s.id, s.assignment_id, a.title AS assignment_title, a.due_date,
              s.status, s.is_acknowledged, s.confirmed_at, u.name AS confirmed_by_name
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN users u ON s.confirmed_by = u.id
       WHERE s.group_id = $1
       ORDER BY s.confirmed_at DESC`,
      [groupId]
    );
    return res.rows;
  }

  /**
   * List all submissions for an assignment across both groups and individual students
   * @param {string} assignmentId
   * @returns {Promise<Array>}
   */
  async listByAssignment(assignmentId) {
    const res = await query(
      `SELECT s.id, s.assignment_id, s.group_id, s.student_id,
              COALESCE(g.name, student_user.name) AS target_name,
              g.name AS group_name, student_user.name AS student_name,
              student_user.student_id AS institutional_id,
              s.status, s.is_acknowledged, s.acknowledged_at,
              s.submission_link, s.confirmed_at,
              confirmer.name AS confirmed_by_name,
              ack_user.name AS acknowledged_by_name
       FROM submissions s
       LEFT JOIN groups g ON s.group_id = g.id
       LEFT JOIN users student_user ON s.student_id = student_user.id
       LEFT JOIN users confirmer ON s.confirmed_by = confirmer.id
       LEFT JOIN users ack_user ON s.acknowledged_by = ack_user.id
       WHERE s.assignment_id = $1
       ORDER BY s.confirmed_at DESC`,
      [assignmentId]
    );
    return res.rows;
  }

  /**
   * Calculate group completion analytics
   * @param {string} groupId
   * @returns {Promise<object>}
   */
  async calculateGroupCompletion(groupId) {
    const res = await query(
      `SELECT 
         COUNT(ag.assignment_id) AS total_assigned,
         COUNT(s.id) FILTER (WHERE s.status IN ('CONFIRMED', 'ACKNOWLEDGED')) AS total_confirmed,
         COUNT(s.id) FILTER (WHERE s.status = 'PENDING') AS total_pending,
         COUNT(ag.assignment_id) - COUNT(s.id) FILTER (WHERE s.status IN ('CONFIRMED', 'ACKNOWLEDGED')) AS remaining_tasks,
         CASE 
           WHEN COUNT(ag.assignment_id) = 0 THEN 0.0
           ELSE ROUND(
             (COUNT(s.id) FILTER (WHERE s.status IN ('CONFIRMED', 'ACKNOWLEDGED'))::DECIMAL / COUNT(ag.assignment_id)::DECIMAL) * 100,
             2
           )
         END AS completion_percentage
       FROM assignment_groups ag
       LEFT JOIN submissions s ON ag.assignment_id = s.assignment_id AND ag.group_id = s.group_id
       WHERE ag.group_id = $1`,
      [groupId]
    );

    const row = res.rows[0];
    return {
      groupId,
      totalAssigned: parseInt(row.total_assigned, 10),
      totalConfirmed: parseInt(row.total_confirmed, 10),
      totalPending: parseInt(row.total_pending, 10),
      remainingTasks: parseInt(row.remaining_tasks, 10),
      completionPercentage: parseFloat(row.completion_percentage),
    };
  }

  /**
   * Check if an assignment is allocated to a specific group
   * @param {string} assignmentId
   * @param {string} groupId
   * @returns {Promise<boolean>}
   */
  async checkAssignmentAssignedToGroup(assignmentId, groupId) {
    const res = await query(
      `SELECT 1 FROM assignment_groups WHERE assignment_id = $1 AND group_id = $2`,
      [assignmentId, groupId]
    );
    return res.rows.length > 0;
  }

  /**
   * Check if a student is a member of a specific group
   * @param {string} groupId
   * @param {string} studentId
   * @returns {Promise<boolean>}
   */
  async isStudentInGroup(groupId, studentId) {
    const res = await query(
      `SELECT 1 FROM group_members WHERE group_id = $1 AND student_id = $2`,
      [groupId, studentId]
    );
    return res.rows.length > 0;
  }

  /**
   * Get submission record with rich details (student name, group name, assignment title)
   * @param {string} assignmentId
   * @param {string} groupId
   * @returns {Promise<object|null>}
   */
  async getSubmissionWithDetails(assignmentId, groupId) {
    const res = await query(
      `SELECT s.id, s.assignment_id, s.group_id, s.confirmed_by, s.confirmed_at, s.status,
              s.is_acknowledged, s.acknowledged_at, s.acknowledged_by, s.submission_link,
              s.created_at, s.updated_at,
              u.name AS confirmed_by_name, u.email AS confirmed_by_email,
              u.student_id AS institutional_id,
              g.name AS group_name,
              a.title AS assignment_title, a.onedrive_link, a.due_date
       FROM submissions s
       JOIN users u ON s.confirmed_by = u.id
       JOIN groups g ON s.group_id = g.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.assignment_id = $1 AND s.group_id = $2`,
      [assignmentId, groupId]
    );
    return res.rows[0] || null;
  }

  /**
   * Get individual submission record with rich details
   * @param {string} assignmentId
   * @param {string} studentId
   * @returns {Promise<object|null>}
   */
  async getIndividualSubmissionWithDetails(assignmentId, studentId) {
    const res = await query(
      `SELECT s.id, s.assignment_id, s.student_id, s.confirmed_by, s.confirmed_at, s.status,
              s.is_acknowledged, s.acknowledged_at, s.acknowledged_by, s.submission_link,
              s.created_at, s.updated_at,
              u.name AS confirmed_by_name, u.email AS confirmed_by_email,
              u.student_id AS institutional_id,
              a.title AS assignment_title, a.onedrive_link, a.due_date
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.assignment_id = $1 AND s.student_id = $2`,
      [assignmentId, studentId]
    );
    return res.rows[0] || null;
  }
}

module.exports = new SubmissionRepository();
