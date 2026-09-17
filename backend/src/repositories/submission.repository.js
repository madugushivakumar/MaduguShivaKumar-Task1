const { query } = require('../config/db.config');

class SubmissionRepository {
  /**
   * Create or update (upsert) an assignment submission record
   * @param {object} param0
   * @param {string} param0.assignmentId
   * @param {string} param0.groupId
   * @param {string} param0.confirmedBy - UUID of confirming student
   * @param {'PENDING'|'CONFIRMED'} [param0.status='CONFIRMED']
   * @returns {Promise<object>}
   */
  async upsertSubmission({
    assignmentId,
    groupId,
    confirmedBy,
    status = 'CONFIRMED',
  }) {
    const res = await query(
      `INSERT INTO submissions (assignment_id, group_id, confirmed_by, confirmed_at, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
       ON CONFLICT (assignment_id, group_id)
       DO UPDATE SET
         confirmed_by = EXCLUDED.confirmed_by,
         confirmed_at = CURRENT_TIMESTAMP,
         status = EXCLUDED.status,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, assignment_id, group_id, confirmed_by, confirmed_at, status, created_at, updated_at`,
      [assignmentId, groupId, confirmedBy, status]
    );
    return res.rows[0];
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
   * List all submissions for a group
   * @param {string} groupId
   * @returns {Promise<Array>}
   */
  async listByGroup(groupId) {
    const res = await query(
      `SELECT s.id, s.assignment_id, a.title AS assignment_title, a.due_date,
              s.status, s.confirmed_at, u.name AS confirmed_by_name
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
   * List all submissions for an assignment across all groups
   * @param {string} assignmentId
   * @returns {Promise<Array>}
   */
  async listByAssignment(assignmentId) {
    const res = await query(
      `SELECT s.id, s.group_id, g.name AS group_name, s.status,
              s.confirmed_at, u.name AS confirmed_by_name
       FROM submissions s
       JOIN groups g ON s.group_id = g.id
       JOIN users u ON s.confirmed_by = u.id
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
         COUNT(s.id) FILTER (WHERE s.status = 'CONFIRMED') AS total_confirmed,
         COUNT(s.id) FILTER (WHERE s.status = 'PENDING') AS total_pending,
         COUNT(ag.assignment_id) - COUNT(s.id) FILTER (WHERE s.status = 'CONFIRMED') AS remaining_tasks,
         CASE 
           WHEN COUNT(ag.assignment_id) = 0 THEN 0.0
           ELSE ROUND(
             (COUNT(s.id) FILTER (WHERE s.status = 'CONFIRMED')::DECIMAL / COUNT(ag.assignment_id)::DECIMAL) * 100,
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
}

module.exports = new SubmissionRepository();
