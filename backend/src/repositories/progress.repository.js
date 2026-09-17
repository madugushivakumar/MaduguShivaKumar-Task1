const { pool, query } = require('../config/db.config');

class ProgressRepository {
  /**
   * Calculate group progress based on assignments assigned to that group
   * @param {string} groupId
   * @returns {Promise<object|null>}
   */
  async getGroupProgress(groupId) {
    const res = await query(
      `SELECT 
        g.id AS group_id,
        g.name AS group_name,
        g.created_by,
        COUNT(DISTINCT ag.assignment_id)::int AS total_assignments,
        COUNT(DISTINCT CASE WHEN s.status = 'CONFIRMED' THEN s.assignment_id END)::int AS completed_assignments,
        COUNT(DISTINCT gm.student_id)::int AS member_count
      FROM groups g
      LEFT JOIN assignment_groups ag ON g.id = ag.group_id
      LEFT JOIN submissions s ON ag.assignment_id = s.assignment_id AND ag.group_id = s.group_id AND s.status = 'CONFIRMED'
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.id = $1
      GROUP BY g.id, g.name, g.created_by`,
      [groupId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    const totalAssignments = row.total_assignments;
    const completedAssignments = row.completed_assignments;
    const pendingAssignments = totalAssignments - completedAssignments;
    const progressPercentage =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    return {
      groupId: row.group_id,
      groupName: row.group_name,
      createdBy: row.created_by,
      memberCount: row.member_count,
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      progressPercentage,
    };
  }

  /**
   * Retrieve all groups with progress metrics for admin monitoring
   * @param {string|null} search
   * @returns {Promise<Array>}
   */
  async getAllGroupsProgress(search = null) {
    const res = await query(
      `SELECT 
        g.id AS group_id,
        g.name AS group_name,
        g.created_by,
        creator.name AS creator_name,
        COUNT(DISTINCT gm.student_id)::int AS member_count,
        COUNT(DISTINCT ag.assignment_id)::int AS total_assignments,
        COUNT(DISTINCT CASE WHEN s.status = 'CONFIRMED' THEN s.assignment_id END)::int AS completed_assignments
      FROM groups g
      LEFT JOIN users creator ON g.created_by = creator.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN assignment_groups ag ON g.id = ag.group_id
      LEFT JOIN submissions s ON ag.assignment_id = s.assignment_id AND ag.group_id = s.group_id AND s.status = 'CONFIRMED'
      WHERE ($1::text IS NULL OR g.name ILIKE '%' || $1 || '%')
      GROUP BY g.id, g.name, g.created_by, creator.name
      ORDER BY g.name ASC`,
      [search ? search.trim() : null]
    );

    return res.rows.map((row) => {
      const totalAssignments = row.total_assignments;
      const completedAssignments = row.completed_assignments;
      const pendingAssignments = totalAssignments - completedAssignments;
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
        createdBy: row.created_by,
        creatorName: row.creator_name || 'Unknown',
        memberCount: row.member_count,
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        progressPercentage,
        status,
      };
    });
  }

  /**
   * Get detailed group metadata, members roster, and assigned coursework with submission status
   * @param {string} groupId
   * @returns {Promise<object|null>}
   */
  async getGroupDetailsWithCoursework(groupId) {
    // 1. Group info & progress
    const progress = await this.getGroupProgress(groupId);
    if (!progress) {
      return null;
    }

    // 2. Members roster
    const membersRes = await query(
      `SELECT u.id, u.name, u.email, u.student_id, gm.joined_at,
              (u.id = g.created_by) AS is_creator
       FROM group_members gm
       JOIN users u ON gm.student_id = u.id
       JOIN groups g ON gm.group_id = g.id
       WHERE gm.group_id = $1
       ORDER BY (u.id = g.created_by) DESC, u.name ASC`,
      [groupId]
    );

    // 3. Assigned coursework with submission status
    const assignmentsRes = await query(
      `SELECT 
        a.id AS assignment_id,
        a.title,
        a.description,
        a.due_date,
        a.onedrive_link,
        ag.assigned_at,
        COALESCE(s.status, 'PENDING') AS submission_status,
        s.confirmed_at,
        s.confirmed_by,
        confirmer.name AS confirmed_by_name,
        confirmer.email AS confirmed_by_email
      FROM assignment_groups ag
      JOIN assignments a ON ag.assignment_id = a.id
      LEFT JOIN submissions s ON ag.assignment_id = s.assignment_id AND ag.group_id = s.group_id
      LEFT JOIN users confirmer ON s.confirmed_by = confirmer.id
      WHERE ag.group_id = $1
      ORDER BY a.due_date ASC`,
      [groupId]
    );

    return {
      group: progress,
      members: membersRes.rows,
      assignments: assignmentsRes.rows,
    };
  }

  /**
   * System-wide statistics summary for the admin dashboard
   * @returns {Promise<object>}
   */
  async getAdminDashboardSummary() {
    const studentsRes = await query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'STUDENT'`);
    const groupsRes = await query(`SELECT COUNT(*)::int AS count FROM groups`);
    const assignmentsRes = await query(`SELECT COUNT(*)::int AS count FROM assignments`);
    const allocationsRes = await query(`SELECT COUNT(*)::int AS count FROM assignment_groups`);
    const confirmedRes = await query(`SELECT COUNT(*)::int AS count FROM submissions WHERE status = 'CONFIRMED'`);

    const totalStudents = studentsRes.rows[0].count;
    const totalGroups = groupsRes.rows[0].count;
    const totalAssignments = assignmentsRes.rows[0].count;
    const totalAllocations = allocationsRes.rows[0].count;
    const confirmedSubmissions = confirmedRes.rows[0].count;
    const pendingSubmissions = Math.max(0, totalAllocations - confirmedSubmissions);
    const overallCompletionPercentage =
      totalAllocations > 0
        ? Math.round((confirmedSubmissions / totalAllocations) * 100)
        : 0;

    // Get group progress rankings (all groups)
    const groupsProgress = await this.getAllGroupsProgress();

    return {
      totalStudents,
      totalGroups,
      totalAssignments,
      totalAllocations,
      confirmedSubmissions,
      pendingSubmissions,
      overallCompletionPercentage,
      groups: groupsProgress,
    };
  }

  /**
   * Assignment-wise submission monitoring
   * @param {string} assignmentId
   * @returns {Promise<object|null>}
   */
  async getAssignmentWiseMonitoring(assignmentId) {
    const assignRes = await query(
      `SELECT a.id, a.title, a.description, a.due_date, a.onedrive_link,
              u.name AS professor_name, a.created_at
       FROM assignments a
       JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [assignmentId]
    );

    if (assignRes.rows.length === 0) {
      return null;
    }

    const assignment = assignRes.rows[0];

    // Query allocated groups and their submission status
    const groupsRes = await query(
      `SELECT 
        g.id AS group_id,
        g.name AS group_name,
        ag.assigned_at,
        COUNT(DISTINCT gm.student_id)::int AS member_count,
        COALESCE(s.status, 'PENDING') AS submission_status,
        s.confirmed_at,
        s.confirmed_by,
        confirmer.name AS confirmed_by_name,
        confirmer.email AS confirmed_by_email
      FROM assignment_groups ag
      JOIN groups g ON ag.group_id = g.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN submissions s ON ag.assignment_id = s.assignment_id AND ag.group_id = s.group_id
      LEFT JOIN users confirmer ON s.confirmed_by = confirmer.id
      WHERE ag.assignment_id = $1
      GROUP BY g.id, g.name, ag.assigned_at, s.status, s.confirmed_at, s.confirmed_by, confirmer.name, confirmer.email
      ORDER BY g.name ASC`,
      [assignmentId]
    );

    const assignedGroups = groupsRes.rows;
    const assignedCount = assignedGroups.length;
    const confirmedCount = assignedGroups.filter((g) => g.submission_status === 'CONFIRMED').length;
    const pendingCount = assignedCount - confirmedCount;
    const completionPercentage =
      assignedCount > 0 ? Math.round((confirmedCount / assignedCount) * 100) : 0;

    return {
      assignment,
      assignedGroupsCount: assignedCount,
      confirmedGroupsCount: confirmedCount,
      pendingGroupsCount: pendingCount,
      completionPercentage,
      groups: assignedGroups,
    };
  }

  /**
   * Student-wise submission confirmation tracking
   * Shows every student in every assigned group, distinguishing the individual
   * confirmer from teammates covered by the group submission
   * @param {object} param0
   * @param {string|null} param0.assignmentId
   * @param {string|null} param0.groupId
   * @param {string|null} param0.search
   * @returns {Promise<Array>}
   */
  async getStudentWiseSubmissionTracking({ assignmentId = null, groupId = null, search = null }) {
    const res = await query(
      `SELECT 
        u.id AS student_id,
        u.name AS student_name,
        u.student_id AS student_code,
        u.email AS student_email,
        g.id AS group_id,
        g.name AS group_name,
        a.id AS assignment_id,
        a.title AS assignment_title,
        a.due_date AS assignment_due_date,
        COALESCE(s.status, 'PENDING') AS group_submission_status,
        (s.confirmed_by = u.id) AS is_confirmer,
        s.confirmed_by,
        confirmer.name AS confirmed_by_name,
        s.confirmed_at
      FROM assignment_groups ag
      JOIN assignments a ON ag.assignment_id = a.id
      JOIN groups g ON ag.group_id = g.id
      JOIN group_members gm ON g.id = gm.group_id
      JOIN users u ON gm.student_id = u.id
      LEFT JOIN submissions s ON ag.assignment_id = s.assignment_id AND ag.group_id = s.group_id
      LEFT JOIN users confirmer ON s.confirmed_by = confirmer.id
      WHERE ($1::uuid IS NULL OR a.id = $1::uuid)
        AND ($2::uuid IS NULL OR g.id = $2::uuid)
        AND ($3::text IS NULL OR (
          u.name ILIKE '%' || $3 || '%' OR 
          u.email ILIKE '%' || $3 || '%' OR 
          COALESCE(u.student_id, '') ILIKE '%' || $3 || '%' OR
          g.name ILIKE '%' || $3 || '%' OR
          a.title ILIKE '%' || $3 || '%'
        ))
      ORDER BY a.due_date ASC, g.name ASC, u.name ASC`,
      [assignmentId, groupId, search ? search.trim() : null]
    );

    return res.rows.map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      studentCode: row.student_code || 'N/A',
      studentEmail: row.student_email,
      groupId: row.group_id,
      groupName: row.group_name,
      assignmentId: row.assignment_id,
      assignmentTitle: row.assignment_title,
      assignmentDueDate: row.assignment_due_date,
      groupSubmissionStatus: row.group_submission_status,
      isConfirmer: Boolean(row.is_confirmer),
      confirmedByName: row.confirmed_by_name || null,
      confirmedAt: row.confirmed_at || null,
    }));
  }
}

module.exports = new ProgressRepository();
