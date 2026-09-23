const { pool, query } = require('../config/db.config');

class CourseRepository {
  /**
   * Create a new academic course
   * @param {object} param0
   * @param {string} param0.name
   * @param {string} param0.code
   * @param {string} param0.description
   * @param {string} param0.professorId
   * @returns {Promise<object>}
   */
  async create({ name, code, description, professorId }) {
    const res = await query(
      `INSERT INTO courses (name, code, description, professor_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, code, description, professor_id, created_at, updated_at`,
      [name, code, description || '', professorId]
    );
    return res.rows[0];
  }

  /**
   * Find course by ID
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const res = await query(
      `SELECT c.*, u.name AS professor_name, u.email AS professor_email
       FROM courses c
       JOIN users u ON c.professor_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  /**
   * Find course by code (e.g. CS101)
   * @param {string} code
   * @returns {Promise<object|null>}
   */
  async findByCode(code) {
    const res = await query(
      `SELECT * FROM courses WHERE UPPER(code) = UPPER($1)`,
      [code]
    );
    return res.rows[0] || null;
  }

  /**
   * Find course with full details: instructor, enrolled students count, and assignments
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findByIdWithDetails(id) {
    const course = await this.findById(id);
    if (!course) return null;

    // Enrolled students count
    const studentCountRes = await query(
      `SELECT COUNT(*)::int AS student_count FROM course_students WHERE course_id = $1`,
      [id]
    );
    course.student_count = studentCountRes.rows[0].student_count || 0;

    // Associated assignments
    const assignmentsRes = await query(
      `SELECT id, title, description, due_date, submission_type, onedrive_link, created_at
       FROM assignments
       WHERE course_id = $1
       ORDER BY due_date ASC`,
      [id]
    );
    course.assignments = assignmentsRes.rows;
    course.assignment_count = assignmentsRes.rows.length;

    return course;
  }

  /**
   * List all courses with professor details and student count
   * @returns {Promise<Array>}
   */
  async listAll() {
    const res = await query(
      `SELECT c.id, c.name, c.code, c.description, c.professor_id,
              u.name AS professor_name, u.email AS professor_email,
              c.created_at, c.updated_at,
              COUNT(DISTINCT cs.student_id)::int AS student_count,
              COUNT(DISTINCT a.id)::int AS assignment_count
       FROM courses c
       JOIN users u ON c.professor_id = u.id
       LEFT JOIN course_students cs ON c.id = cs.course_id
       LEFT JOIN assignments a ON c.id = a.course_id
       GROUP BY c.id, u.name, u.email
       ORDER BY c.code ASC`
    );
    return res.rows;
  }

  /**
   * List courses taught by a specific professor
   * @param {string} professorId
   * @returns {Promise<Array>}
   */
  async listByProfessor(professorId) {
    const res = await query(
      `SELECT c.id, c.name, c.code, c.description, c.professor_id,
              u.name AS professor_name, u.email AS professor_email,
              c.created_at, c.updated_at,
              COUNT(DISTINCT cs.student_id)::int AS student_count,
              COUNT(DISTINCT a.id)::int AS assignment_count
       FROM courses c
       JOIN users u ON c.professor_id = u.id
       LEFT JOIN course_students cs ON c.id = cs.course_id
       LEFT JOIN assignments a ON c.id = a.course_id
       WHERE c.professor_id = $1
       GROUP BY c.id, u.name, u.email
       ORDER BY c.code ASC`,
      [professorId]
    );
    return res.rows;
  }

  /**
   * List courses a student is enrolled in
   * @param {string} studentId
   * @returns {Promise<Array>}
   */
  async listEnrolledByStudent(studentId) {
    const res = await query(
      `SELECT c.id, c.name, c.code, c.description, c.professor_id,
              u.name AS professor_name, u.email AS professor_email,
              cs.enrolled_at,
              COUNT(DISTINCT a.id)::int AS assignment_count
       FROM course_students cs
       JOIN courses c ON cs.course_id = c.id
       JOIN users u ON c.professor_id = u.id
       LEFT JOIN assignments a ON c.id = a.course_id
       WHERE cs.student_id = $1
       GROUP BY c.id, u.name, u.email, cs.enrolled_at
       ORDER BY c.code ASC`,
      [studentId]
    );
    return res.rows;
  }

  /**
   * Update course details
   * @param {string} id
   * @param {object} updates
   * @returns {Promise<object|null>}
   */
  async update(id, { name, code, description }) {
    const res = await query(
      `UPDATE courses
       SET name = COALESCE($2, name),
           code = COALESCE($3, code),
           description = COALESCE($4, description)
       WHERE id = $1
       RETURNING id, name, code, description, professor_id, created_at, updated_at`,
      [id, name, code, description]
    );
    return res.rows[0] || null;
  }

  /**
   * Delete course
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const res = await query(
      `DELETE FROM courses WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rowCount > 0;
  }

  /**
   * Enroll a student in a course
   * @param {string} courseId
   * @param {string} studentId
   * @returns {Promise<object>}
   */
  async enrollStudent(courseId, studentId) {
    const res = await query(
      `INSERT INTO course_students (course_id, student_id)
       VALUES ($1, $2)
       ON CONFLICT (course_id, student_id) DO NOTHING
       RETURNING id, course_id, student_id, enrolled_at`,
      [courseId, studentId]
    );
    return res.rows[0] || null;
  }

  /**
   * Check if a student is enrolled in a course
   * @param {string} courseId
   * @param {string} studentId
   * @returns {Promise<boolean>}
   */
  async isStudentEnrolled(courseId, studentId) {
    const res = await query(
      `SELECT 1 FROM course_students WHERE course_id = $1 AND student_id = $2`,
      [courseId, studentId]
    );
    return res.rowCount > 0;
  }

  /**
   * List enrolled students for a course
   * @param {string} courseId
   * @returns {Promise<Array>}
   */
  async listEnrolledStudents(courseId) {
    const res = await query(
      `SELECT u.id, u.name, u.email, u.student_id, cs.enrolled_at
       FROM course_students cs
       JOIN users u ON cs.student_id = u.id
       WHERE cs.course_id = $1
       ORDER BY u.name ASC`,
      [courseId]
    );
    return res.rows;
  }
}

module.exports = new CourseRepository();
