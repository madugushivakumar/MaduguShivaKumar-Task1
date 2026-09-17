const { query } = require('../config/db.config');

class AnalyticsRepository {
  /**
   * Calculate system-wide overview metrics directly from database tables
   * @returns {Promise<object>}
   */
  async getOverview() {
    const res = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE role = 'STUDENT') AS total_students,
        (SELECT COUNT(*)::int FROM groups) AS total_groups,
        (SELECT COUNT(*)::int FROM assignments) AS total_assignments,
        (SELECT COUNT(*)::int FROM assignment_groups) AS total_assigned_groups,
        (SELECT COUNT(*)::int FROM submissions WHERE status = 'CONFIRMED') AS confirmed_submissions
    `);

    const row = res.rows[0];
    const totalStudents = parseInt(row.total_students, 10) || 0;
    const totalGroups = parseInt(row.total_groups, 10) || 0;
    const totalAssignments = parseInt(row.total_assignments, 10) || 0;
    const totalAssignedGroups = parseInt(row.total_assigned_groups, 10) || 0;
    const confirmedSubmissions = parseInt(row.confirmed_submissions, 10) || 0;
    const pendingSubmissions = Math.max(0, totalAssignedGroups - confirmedSubmissions);
    const overallCompletionPercentage =
      totalAssignedGroups > 0
        ? Math.round((confirmedSubmissions / totalAssignedGroups) * 100)
        : 0;

    return {
      totalStudents,
      totalGroups,
      totalAssignments,
      totalAssignedGroups,
      confirmedSubmissions,
      pendingSubmissions,
      overallCompletionPercentage,
    };
  }

  /**
   * Calculate assignment completion metrics across all groups
   * @param {object} [filters]
   * @param {string} [filters.search]
   * @returns {Promise<Array>}
   */
  async getAssignmentAnalytics({ search = null } = {}) {
    const res = await query(
      `SELECT 
        a.id AS assignment_id,
        a.title,
        a.due_date,
        a.onedrive_link,
        a.created_at,
        COUNT(DISTINCT ag.group_id)::int AS total_groups,
        COUNT(DISTINCT CASE WHEN s.status = 'CONFIRMED' THEN ag.group_id END)::int AS confirmed_groups
      FROM assignments a
      LEFT JOIN assignment_groups ag ON a.id = ag.assignment_id
      LEFT JOIN submissions s ON ag.assignment_id = s.assignment_id AND ag.group_id = s.group_id
      WHERE ($1::text IS NULL OR a.title ILIKE '%' || $1 || '%')
      GROUP BY a.id, a.title, a.due_date, a.onedrive_link, a.created_at
      ORDER BY a.due_date ASC, a.created_at DESC`,
      [search ? search.trim() : null]
    );

    return res.rows.map((row) => {
      const totalGroups = row.total_groups;
      const confirmedGroups = row.confirmed_groups;
      const pendingGroups = Math.max(0, totalGroups - confirmedGroups);
      const completionPercentage =
        totalGroups > 0 ? Math.round((confirmedGroups / totalGroups) * 100) : 0;

      return {
        assignmentId: row.assignment_id,
        title: row.title,
        dueDate: row.due_date,
        onedriveLink: row.onedrive_link,
        createdAt: row.created_at,
        totalGroups,
        confirmedGroups,
        pendingGroups,
        completionPercentage,
      };
    });
  }

  /**
   * Calculate group performance metrics across all assignments
   * @param {object} [filters]
   * @param {string} [filters.search]
   * @returns {Promise<Array>}
   */
  async getGroupAnalytics({ search = null } = {}) {
    const res = await query(
      `SELECT 
        g.id AS group_id,
        g.name AS group_name,
        g.created_at,
        COUNT(DISTINCT gm.student_id)::int AS member_count,
        COUNT(DISTINCT ag.assignment_id)::int AS total_assignments,
        COUNT(DISTINCT CASE WHEN s.status = 'CONFIRMED' THEN ag.assignment_id END)::int AS completed_assignments
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN assignment_groups ag ON g.id = ag.group_id
      LEFT JOIN submissions s ON ag.assignment_id = s.assignment_id AND ag.group_id = s.group_id
      WHERE ($1::text IS NULL OR g.name ILIKE '%' || $1 || '%')
      GROUP BY g.id, g.name, g.created_at
      ORDER BY g.name ASC`,
      [search ? search.trim() : null]
    );

    return res.rows.map((row) => {
      const totalAssignments = row.total_assignments;
      const completedAssignments = row.completed_assignments;
      const pendingAssignments = Math.max(0, totalAssignments - completedAssignments);
      const progressPercentage =
        totalAssignments > 0
          ? Math.round((completedAssignments / totalAssignments) * 100)
          : 0;

      let status = 'NOT_STARTED';
      if (totalAssignments > 0) {
        if (completedAssignments === totalAssignments) {
          status = 'COMPLETED';
        } else if (completedAssignments > 0) {
          status = 'IN_PROGRESS';
        }
      }

      return {
        groupId: row.group_id,
        groupName: row.group_name,
        memberCount: row.member_count,
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        progressPercentage,
        status,
        createdAt: row.created_at,
      };
    });
  }

  /**
   * Retrieve recent confirmed submissions with details for the dashboard table
   * @param {object} [options]
   * @param {number} [options.limit=10]
   * @param {string|null} [options.assignmentId]
   * @param {string|null} [options.groupId]
   * @param {string|null} [options.status]
   * @returns {Promise<Array>}
   */
  async getRecentSubmissions({ limit = 10, assignmentId = null, groupId = null, status = null } = {}) {
    const res = await query(
      `SELECT 
        s.id,
        s.assignment_id,
        a.title AS assignment_title,
        s.group_id,
        g.name AS group_name,
        s.confirmed_by,
        u.name AS confirmed_by_name,
        u.email AS confirmed_by_email,
        s.status,
        s.confirmed_at
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN groups g ON s.group_id = g.id
      JOIN users u ON s.confirmed_by = u.id
      WHERE ($1::uuid IS NULL OR s.assignment_id = $1::uuid)
        AND ($2::uuid IS NULL OR s.group_id = $2::uuid)
        AND ($3::text IS NULL OR s.status = $3::text)
      ORDER BY s.confirmed_at DESC
      LIMIT $4`,
      [assignmentId, groupId, status, limit]
    );

    return res.rows.map((r) => ({
      id: r.id,
      assignmentId: r.assignment_id,
      assignmentTitle: r.assignment_title,
      groupId: r.group_id,
      groupName: r.group_name,
      confirmedBy: r.confirmed_by,
      confirmedByName: r.confirmed_by_name,
      confirmedByEmail: r.confirmed_by_email,
      status: r.status,
      confirmedAt: r.confirmed_at,
    }));
  }
}

module.exports = new AnalyticsRepository();
