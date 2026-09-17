const { pool, query } = require('../config/db.config');

class GroupRepository {
  /**
   * Create a new student group and automatically enroll creator as member in a transaction
   * @param {object} param0
   * @param {string} param0.name
   * @param {string} param0.createdBy - UUID of student creator
   * @returns {Promise<object>}
   */
  async createWithCreatorAsMember({ name, createdBy }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert Group record
      const groupRes = await client.query(
        `INSERT INTO groups (name, created_by)
         VALUES ($1, $2)
         RETURNING id, name, created_by, created_at, updated_at`,
        [name, createdBy]
      );
      const newGroup = groupRes.rows[0];

      // 2. Automatically enroll creator as the first member
      await client.query(
        `INSERT INTO group_members (group_id, student_id)
         VALUES ($1, $2)
         ON CONFLICT (group_id, student_id) DO NOTHING`,
        [newGroup.id, createdBy]
      );

      await client.query('COMMIT');
      return newGroup;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find a group by UUID
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const res = await query(
      `SELECT g.id, g.name, g.created_by, u.name AS creator_name, u.email AS creator_email, g.created_at, g.updated_at
       FROM groups g
       JOIN users u ON g.created_by = u.id
       WHERE g.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  /**
   * Find a group by UUID with member count
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findByIdWithDetails(id) {
    const res = await query(
      `SELECT g.id, g.name, g.created_by,
              u.name AS creator_name, u.email AS creator_email,
              g.created_at, g.updated_at,
              COUNT(gm.id)::int AS member_count
       FROM groups g
       JOIN users u ON g.created_by = u.id
       LEFT JOIN group_members gm ON g.id = gm.group_id
       WHERE g.id = $1
       GROUP BY g.id, u.name, u.email`,
      [id]
    );
    return res.rows[0] || null;
  }

  /**
   * Check if a student is a member of a group
   * @param {string} groupId
   * @param {string} studentId
   * @returns {Promise<boolean>}
   */
  async isMember(groupId, studentId) {
    const res = await query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND student_id = $2',
      [groupId, studentId]
    );
    return res.rowCount > 0;
  }

  /**
   * Check if a student is the creator of a group
   * @param {string} groupId
   * @param {string} studentId
   * @returns {Promise<boolean>}
   */
  async isCreator(groupId, studentId) {
    const res = await query(
      'SELECT 1 FROM groups WHERE id = $1 AND created_by = $2',
      [groupId, studentId]
    );
    return res.rowCount > 0;
  }

  /**
   * Add a student member to a group
   * @param {object} param0
   * @param {string} param0.groupId
   * @param {string} param0.studentId
   * @returns {Promise<object>}
   */
  async addMember({ groupId, studentId }) {
    const res = await query(
      `INSERT INTO group_members (group_id, student_id)
       VALUES ($1, $2)
       RETURNING id, group_id, student_id, joined_at`,
      [groupId, studentId]
    );
    return res.rows[0];
  }

  /**
   * Remove a student member from a group
   * @param {object} param0
   * @param {string} param0.groupId
   * @param {string} param0.studentId
   * @returns {Promise<boolean>}
   */
  async removeMember({ groupId, studentId }) {
    const res = await query(
      'DELETE FROM group_members WHERE group_id = $1 AND student_id = $2',
      [groupId, studentId]
    );
    return res.rowCount > 0;
  }

  /**
   * List all student members in a group with user profile info
   * @param {string} groupId
   * @returns {Promise<Array>}
   */
  async listMembers(groupId) {
    const res = await query(
      `SELECT gm.id AS membership_id, gm.joined_at,
              u.id AS student_id, u.name, u.email, u.student_id AS institutional_id, u.role
       FROM group_members gm
       JOIN users u ON gm.student_id = u.id
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at ASC`,
      [groupId]
    );
    return res.rows;
  }

  /**
   * List all groups relevant to a specific student (joined or created)
   * @param {string} studentId
   * @returns {Promise<Array>}
   */
  async listGroupsForStudent(studentId) {
    const res = await query(
      `SELECT g.id, g.name, g.created_by,
              creator.name AS creator_name,
              g.created_at, g.updated_at,
              COUNT(DISTINCT all_members.id)::int AS member_count,
              (g.created_by = $1) AS is_creator
       FROM groups g
       JOIN users creator ON g.created_by = creator.id
       JOIN group_members my_membership ON g.id = my_membership.group_id AND my_membership.student_id = $1
       LEFT JOIN group_members all_members ON g.id = all_members.group_id
       GROUP BY g.id, creator.name
       ORDER BY g.created_at DESC`,
      [studentId]
    );
    return res.rows;
  }

  /**
   * List all groups in system (for administrative access)
   * @returns {Promise<Array>}
   */
  async listAll() {
    const res = await query(
      `SELECT g.id, g.name, g.created_by,
              u.name AS creator_name, u.email AS creator_email,
              COUNT(gm.id)::int AS member_count,
              g.created_at, g.updated_at
       FROM groups g
       JOIN users u ON g.created_by = u.id
       LEFT JOIN group_members gm ON g.id = gm.group_id
       GROUP BY g.id, u.name, u.email
       ORDER BY g.created_at DESC`
    );
    return res.rows;
  }

  /**
   * Resolve user by email OR student_id
   * @param {object} param0
   * @param {string} [param0.email]
   * @param {string} [param0.studentId]
   * @returns {Promise<object|null>}
   */
  async findUserForMembership({ email, studentId }) {
    if (email) {
      const res = await query(
        'SELECT id, name, email, role, student_id FROM users WHERE LOWER(email) = LOWER($1)',
        [email.trim()]
      );
      if (res.rows[0]) return res.rows[0];
    }

    if (studentId) {
      const res = await query(
        'SELECT id, name, email, role, student_id FROM users WHERE UPPER(student_id) = UPPER($1)',
        [studentId.trim()]
      );
      if (res.rows[0]) return res.rows[0];
    }

    return null;
  }

  /**
   * Find user strictly by email
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findUserByEmail(email) {
    if (!email) return null;
    const res = await query(
      'SELECT id, name, email, role, student_id FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    return res.rows[0] || null;
  }

  /**
   * Find user strictly by student_id
   * @param {string} studentId
   * @returns {Promise<object|null>}
   */
  async findUserByStudentId(studentId) {
    if (!studentId) return null;
    const res = await query(
      'SELECT id, name, email, role, student_id FROM users WHERE UPPER(student_id) = UPPER($1)',
      [studentId.trim()]
    );
    return res.rows[0] || null;
  }

  /**
   * Add member to group, optionally creating a new student record atomically in a transaction
   * @param {object} param0
   * @param {string} param0.groupId
   * @param {string} [param0.existingUserId]
   * @param {object} [param0.newStudent]
   * @param {string} param0.newStudent.name
   * @param {string} param0.newStudent.email
   * @param {string} param0.newStudent.studentId
   * @param {string} param0.newStudent.passwordHash
   * @returns {Promise<{user: object, member: object}>}
   */
  async addMemberWithResolution({ groupId, existingUserId, newStudent }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let targetUser = null;

      if (newStudent) {
        // Insert new student record with strictly enforced STUDENT role
        const userRes = await client.query(
          `INSERT INTO users (name, email, password_hash, role, student_id)
           VALUES ($1, $2, $3, 'STUDENT', $4)
           RETURNING id, name, email, role, student_id, created_at, updated_at`,
          [newStudent.name, newStudent.email, newStudent.passwordHash, newStudent.studentId]
        );
        targetUser = userRes.rows[0];
      } else {
        const userRes = await client.query(
          'SELECT id, name, email, role, student_id FROM users WHERE id = $1',
          [existingUserId]
        );
        targetUser = userRes.rows[0];
      }

      if (!targetUser) {
        throw new Error('Target user could not be resolved for group membership.');
      }

      // Insert group membership
      const memberRes = await client.query(
        `INSERT INTO group_members (group_id, student_id)
         VALUES ($1, $2)
         RETURNING id, group_id, student_id, joined_at`,
        [groupId, targetUser.id]
      );

      await client.query('COMMIT');
      return {
        user: targetUser,
        member: memberRes.rows[0],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new GroupRepository();
