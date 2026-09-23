const { pool, query } = require('../config/db.config');

class AssignmentRepository {
  /**
   * Create an assignment with optional initial group allocation within a transaction
   * @param {object} param0
   * @param {string} param0.title
   * @param {string} param0.description
   * @param {string} param0.dueDate
   * @param {string} param0.onedriveLink
   * @param {string} param0.createdBy
   * @param {string} [param0.courseId]
   * @param {string} [param0.submissionType]
   * @param {Array<string>} [param0.groupIds]
   * @param {boolean} [param0.assignAll]
   * @returns {Promise<object>}
   */
  async createWithTransaction({
    title,
    description,
    dueDate,
    onedriveLink,
    createdBy,
    courseId = null,
    submissionType = 'GROUP',
    groupIds = [],
    assignAll = false,
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert assignment
      const assignmentRes = await client.query(
        `INSERT INTO assignments (title, description, due_date, onedrive_link, created_by, course_id, submission_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, description, due_date, onedrive_link, created_by, course_id, submission_type, created_at, updated_at`,
        [title, description, dueDate, onedriveLink, createdBy, courseId, submissionType]
      );
      const assignment = assignmentRes.rows[0];

      let assignedGroups = [];

      // 2. Assign to groups if applicable and requested
      if (submissionType === 'GROUP') {
        if (assignAll) {
          const assignAllRes = await client.query(
            `INSERT INTO assignment_groups (assignment_id, group_id)
             SELECT $1, id FROM groups
             ON CONFLICT (assignment_id, group_id) DO NOTHING
             RETURNING group_id`,
            [assignment.id]
          );

          const groupsRes = await client.query(
            `SELECT id, name FROM groups WHERE id = ANY($1) ORDER BY name ASC`,
            [assignAllRes.rows.map((r) => r.group_id)]
          );
          assignedGroups = groupsRes.rows;
        } else if (groupIds && groupIds.length > 0) {
          for (const gid of groupIds) {
            await client.query(
              `INSERT INTO assignment_groups (assignment_id, group_id)
               VALUES ($1, $2)
               ON CONFLICT (assignment_id, group_id) DO NOTHING`,
              [assignment.id, gid]
            );
          }

          const groupsRes = await client.query(
            `SELECT id, name FROM groups WHERE id = ANY($1) ORDER BY name ASC`,
            [groupIds]
          );
          assignedGroups = groupsRes.rows;
        }
      }

      await client.query('COMMIT');

      return {
        ...assignment,
        assigned_groups: assignedGroups,
        assigned_groups_count: assignedGroups.length,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Find an assignment by UUID
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const res = await query(
      `SELECT a.id, a.title, a.description, a.due_date, a.onedrive_link, a.created_by,
              a.course_id, a.submission_type, a.created_at, a.updated_at,
              c.name AS course_name, c.code AS course_code
       FROM assignments a
       LEFT JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  /**
   * Find an assignment by UUID with creator details and assigned groups roster
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findByIdWithDetails(id) {
    const res = await query(
      `SELECT a.id, a.title, a.description, a.due_date, a.onedrive_link,
              a.created_by, a.course_id, a.submission_type,
              c.name AS course_name, c.code AS course_code,
              u.name AS professor_name, u.email AS professor_email,
              a.created_at, a.updated_at
       FROM assignments a
       JOIN users u ON a.created_by = u.id
       LEFT JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const assignment = res.rows[0];

    // Fetch assigned groups
    const groupsRes = await query(
      `SELECT g.id, g.name, g.created_by AS group_creator_id, ag.assigned_at,
              COUNT(gm.student_id)::int AS member_count
       FROM assignment_groups ag
       JOIN groups g ON ag.group_id = g.id
       LEFT JOIN group_members gm ON g.id = gm.group_id
       WHERE ag.assignment_id = $1
       GROUP BY g.id, g.name, g.created_by, ag.assigned_at
       ORDER BY g.name ASC`,
      [id]
    );

    assignment.assigned_groups = groupsRes.rows;
    assignment.assigned_groups_count = groupsRes.rows.length;

    return assignment;
  }

  /**
   * Find assignments allocated to a specific group
   * @param {string} groupId
   * @returns {Promise<Array>}
   */
  async findAssignmentsForGroup(groupId) {
    const res = await query(
      `SELECT a.*, c.name AS course_name, c.code AS course_code
       FROM assignments a
       JOIN assignment_groups ag ON a.id = ag.assignment_id
       LEFT JOIN courses c ON a.course_id = c.id
       WHERE ag.group_id = $1`,
      [groupId]
    );
    return res.rows;
  }

  /**
   * Update an existing assignment record
   * @param {string} id
   * @param {object} updates
   * @returns {Promise<object|null>}
   */
  async update(id, { title, description, dueDate, onedriveLink, courseId, submissionType }) {
    const res = await query(
      `UPDATE assignments
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           due_date = COALESCE($4, due_date),
           onedrive_link = COALESCE($5, onedrive_link),
           course_id = COALESCE($6, course_id),
           submission_type = COALESCE($7, submission_type)
       WHERE id = $1
       RETURNING id, title, description, due_date, onedrive_link, created_by, course_id, submission_type, created_at, updated_at`,
      [id, title, description, dueDate, onedriveLink, courseId, submissionType]
    );
    return res.rows[0] || null;
  }

  /**
   * Assign an assignment to specific groups atomically
   * @param {string} assignmentId
   * @param {Array<string>} groupIds
   * @returns {Promise<object>}
   */
  async assignToGroups(assignmentId, groupIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existingGroupsRes = await client.query(
        `SELECT id, name FROM groups WHERE id = ANY($1)`,
        [groupIds]
      );
      const existingIds = new Set(existingGroupsRes.rows.map((g) => g.id));
      const missing = groupIds.filter((gid) => !existingIds.has(gid));

      if (missing.length > 0) {
        throw new Error(`The following group IDs do not exist: ${missing.join(', ')}`);
      }

      for (const gid of groupIds) {
        await client.query(
          `INSERT INTO assignment_groups (assignment_id, group_id)
           VALUES ($1, $2)
           ON CONFLICT (assignment_id, group_id) DO NOTHING`,
          [assignmentId, gid]
        );
      }

      const allAssignedRes = await client.query(
        `SELECT g.id, g.name, ag.assigned_at
         FROM assignment_groups ag
         JOIN groups g ON ag.group_id = g.id
         WHERE ag.assignment_id = $1
         ORDER BY g.name ASC`,
        [assignmentId]
      );

      await client.query('COMMIT');

      return {
        assignmentId,
        assignedGroups: allAssignedRes.rows,
        totalAssigned: allAssignedRes.rows.length,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Assign an assignment to all existing eligible groups in the system atomically
   * @param {string} assignmentId
   * @returns {Promise<object>}
   */
  async assignToAllGroups(assignmentId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO assignment_groups (assignment_id, group_id)
         SELECT $1, id FROM groups
         ON CONFLICT (assignment_id, group_id) DO NOTHING`,
        [assignmentId]
      );

      const allAssignedRes = await client.query(
        `SELECT g.id, g.name, ag.assigned_at
         FROM assignment_groups ag
         JOIN groups g ON ag.group_id = g.id
         WHERE ag.assignment_id = $1
         ORDER BY g.name ASC`,
        [assignmentId]
      );

      await client.query('COMMIT');

      return {
        assignmentId,
        assignedGroups: allAssignedRes.rows,
        totalAssigned: allAssignedRes.rows.length,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Find all coursework for a student across both Group and Individual assignments
   * @param {string} studentId
   * @param {object} [filters]
   * @returns {Promise<Array>}
   */
  async findAssignmentsForStudent(studentId, { courseId = null } = {}) {
    // 1. Group Coursework (Deduplicated by assignment ID so students in multiple groups receive each coursework once)
    const groupCourseworkQuery = `
      SELECT DISTINCT ON (a.id)
        a.id, a.title, a.description, a.due_date, a.onedrive_link,
        a.created_by, u.name AS professor_name, u.email AS professor_email,
        a.course_id, c.name AS course_name, c.code AS course_code,
        a.submission_type, a.created_at, a.updated_at,
        g.id AS group_id, g.name AS group_name, g.created_by AS group_creator_id,
        (g.created_by = $1) AS is_group_leader,
        ag.assigned_at,
        COALESCE(s.status, 'PENDING') AS submission_status,
        s.confirmed_at,
        s.confirmed_by,
        s.is_acknowledged,
        s.acknowledged_at,
        s.acknowledged_by,
        confirmer.name AS confirmed_by_name
      FROM assignments a
      JOIN assignment_groups ag ON a.id = ag.assignment_id
      JOIN groups g ON ag.group_id = g.id
      JOIN group_members gm ON g.id = gm.group_id AND gm.student_id = $1
      JOIN users u ON a.created_by = u.id
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND g.id = s.group_id
      LEFT JOIN users confirmer ON s.confirmed_by = confirmer.id
      WHERE a.submission_type = 'GROUP'
        AND ($2::uuid IS NULL OR a.course_id = $2::uuid)
      ORDER BY a.id,
        CASE
          WHEN s.status = 'ACKNOWLEDGED' THEN 1
          WHEN s.status = 'CONFIRMED' THEN 2
          WHEN s.status = 'SUBMITTED' THEN 3
          ELSE 4
        END ASC,
        ag.assigned_at DESC
    `;

    // 2. Individual Coursework (via course enrollment)
    const individualCourseworkQuery = `
      SELECT DISTINCT
        a.id, a.title, a.description, a.due_date, a.onedrive_link,
        a.created_by, u.name AS professor_name, u.email AS professor_email,
        a.course_id, c.name AS course_name, c.code AS course_code,
        a.submission_type, a.created_at, a.updated_at,
        NULL::uuid AS group_id, NULL::text AS group_name, NULL::uuid AS group_creator_id,
        FALSE AS is_group_leader,
        cs.enrolled_at AS assigned_at,
        COALESCE(s.status, 'PENDING') AS submission_status,
        s.confirmed_at,
        s.confirmed_by,
        s.is_acknowledged,
        s.acknowledged_at,
        s.acknowledged_by,
        confirmer.name AS confirmed_by_name
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN course_students cs ON c.id = cs.course_id AND cs.student_id = $1
      JOIN users u ON a.created_by = u.id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
      LEFT JOIN users confirmer ON s.confirmed_by = confirmer.id
      WHERE a.submission_type = 'INDIVIDUAL'
        AND ($2::uuid IS NULL OR a.course_id = $2::uuid)
    `;

    const fullQuery = `
      (${groupCourseworkQuery})
      UNION ALL
      (${individualCourseworkQuery})
      ORDER BY due_date ASC
    `;

    const res = await query(fullQuery, [studentId, courseId]);
    return res.rows;
  }

  /**
   * Find specific assignment details for a student (Group or Individual)
   * @param {string} assignmentId
   * @param {string} studentId
   * @param {string} [groupId]
   * @returns {Promise<object|null>}
   */
  async findStudentAssignmentById(assignmentId, studentId, groupId = null) {
    const basic = await this.findById(assignmentId);
    if (!basic) return null;

    if (basic.submission_type === 'INDIVIDUAL') {
      const res = await query(
        `SELECT a.id, a.title, a.description, a.due_date, a.onedrive_link,
                a.created_by, u.name AS professor_name, u.email AS professor_email,
                a.course_id, c.name AS course_name, c.code AS course_code,
                a.submission_type, a.created_at, a.updated_at,
                NULL::uuid AS group_id, NULL::text AS group_name,
                FALSE AS is_group_leader,
                COALESCE(s.status, 'PENDING') AS submission_status,
                s.submission_link,
                s.confirmed_at,
                s.confirmed_by,
                s.is_acknowledged,
                s.acknowledged_at,
                s.acknowledged_by,
                confirmer.name AS confirmed_by_name
         FROM assignments a
         JOIN courses c ON a.course_id = c.id
         JOIN course_students cs ON c.id = cs.course_id AND cs.student_id = $2
         JOIN users u ON a.created_by = u.id
         LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $2
         LEFT JOIN users confirmer ON s.confirmed_by = confirmer.id
         WHERE a.id = $1`,
        [assignmentId, studentId]
      );
      return res.rows[0] || null;
    }

    // GROUP Assignment
    const res = await query(
      `SELECT a.id, a.title, a.description, a.due_date, a.onedrive_link,
              a.created_by, u.name AS professor_name, u.email AS professor_email,
              a.course_id, c.name AS course_name, c.code AS course_code,
              a.submission_type, a.created_at, a.updated_at,
              g.id AS group_id, g.name AS group_name, g.created_by AS group_creator_id,
              (g.created_by = $2) AS is_group_leader,
              ag.assigned_at,
              COALESCE(s.status, 'PENDING') AS submission_status,
              s.submission_link,
              s.confirmed_at,
              s.confirmed_by,
              s.is_acknowledged,
              s.acknowledged_at,
              s.acknowledged_by,
              confirmer.name AS confirmed_by_name
       FROM assignments a
       JOIN assignment_groups ag ON a.id = ag.assignment_id
       JOIN groups g ON ag.group_id = g.id
       JOIN group_members gm ON g.id = gm.group_id AND gm.student_id = $2
       JOIN users u ON a.created_by = u.id
       LEFT JOIN courses c ON a.course_id = c.id
       LEFT JOIN submissions s ON a.id = s.assignment_id AND g.id = s.group_id
       LEFT JOIN users confirmer ON s.confirmed_by = confirmer.id
       WHERE a.id = $1 AND ($3::uuid IS NULL OR g.id = $3::uuid)
       ORDER BY ag.assigned_at DESC
       LIMIT 1`,
      [assignmentId, studentId, groupId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const assignment = res.rows[0];

    // Get all groups allocated to this student for this assignment
    const studentGroupsRes = await query(
      `SELECT g.id, g.name, (g.created_by = $2) AS is_leader,
              COALESCE(s.status, 'PENDING') AS submission_status, s.confirmed_at, s.is_acknowledged
       FROM groups g
       JOIN assignment_groups ag ON g.id = ag.group_id AND ag.assignment_id = $1
       JOIN group_members gm ON g.id = gm.group_id AND gm.student_id = $2
       LEFT JOIN submissions s ON ag.assignment_id = s.assignment_id AND g.id = s.group_id
       ORDER BY g.name ASC`,
      [assignmentId, studentId]
    );
    assignment.student_groups = studentGroupsRes.rows;

    return assignment;
  }

  /**
   * List all managed assignments for faculty / admins
   * @param {object} [filters]
   * @returns {Promise<Array>}
   */
  async listManagedAssignments({ courseId = null, submissionType = null } = {}) {
    const res = await query(
      `SELECT a.id, a.title, a.description, a.due_date, a.onedrive_link,
              a.created_by, a.course_id, a.submission_type,
              c.name AS course_name, c.code AS course_code,
              u.name AS professor_name, u.email AS professor_email,
              a.created_at, a.updated_at,
              COUNT(DISTINCT ag.group_id)::int AS assigned_groups_count,
              COALESCE(
                json_agg(
                  json_build_object('id', g.id, 'name', g.name)
                ) FILTER (WHERE g.id IS NOT NULL),
                '[]'
              ) AS assigned_groups
       FROM assignments a
       JOIN users u ON a.created_by = u.id
       LEFT JOIN courses c ON a.course_id = c.id
       LEFT JOIN assignment_groups ag ON a.id = ag.assignment_id
       LEFT JOIN groups g ON ag.group_id = g.id
       WHERE ($1::uuid IS NULL OR a.course_id = $1::uuid)
         AND ($2::varchar IS NULL OR a.submission_type = $2::varchar)
       GROUP BY a.id, u.name, u.email, c.name, c.code
       ORDER BY a.created_at DESC`,
      [courseId, submissionType]
    );
    return res.rows;
  }

  /**
   * Delete an assignment by ID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const res = await query(
      `DELETE FROM assignments WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rowCount > 0;
  }
}

module.exports = new AssignmentRepository();
