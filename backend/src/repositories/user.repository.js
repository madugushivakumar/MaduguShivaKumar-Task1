const { query } = require('../config/db.config');

class UserRepository {
  /**
   * Find a user by email
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    const res = await query(
      'SELECT id, name, email, password_hash, role, student_id, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return res.rows[0] || null;
  }

  /**
   * Find a user by UUID
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const res = await query(
      'SELECT id, name, email, role, student_id, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  /**
   * Find a student by student_id
   * @param {string} studentId
   * @returns {Promise<object|null>}
   */
  async findByStudentId(studentId) {
    const res = await query(
      'SELECT id, name, email, role, student_id, created_at, updated_at FROM users WHERE student_id = $1',
      [studentId]
    );
    return res.rows[0] || null;
  }

  /**
   * Create a new user
   * @param {object} param0
   * @param {string} param0.name
   * @param {string} param0.email
   * @param {string} param0.passwordHash
   * @param {'STUDENT'|'ADMIN'} param0.role
   * @param {string|null} [param0.studentId]
   * @returns {Promise<object>}
   */
  async create({ name, email, passwordHash, role, studentId = null }) {
    const res = await query(
      `INSERT INTO users (name, email, password_hash, role, student_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, student_id, created_at, updated_at`,
      [name, email, passwordHash, role, studentId]
    );
    return res.rows[0];
  }

  /**
   * List users by role
   * @param {'STUDENT'|'ADMIN'} role
   * @returns {Promise<Array>}
   */
  async listByRole(role) {
    const res = await query(
      'SELECT id, name, email, role, student_id, created_at FROM users WHERE role = $1 ORDER BY name ASC',
      [role]
    );
    return res.rows;
  }
}

module.exports = new UserRepository();
