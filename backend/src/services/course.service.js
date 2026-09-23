const courseRepository = require('../repositories/course.repository');
const userRepository = require('../repositories/user.repository');
const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class CourseService {
  /**
   * Create a new academic course (Professor only)
   * @param {string} professorId
   * @param {object} param1
   * @param {string} param1.name
   * @param {string} param1.code
   * @param {string} param1.description
   * @returns {Promise<object>}
   */
  async createCourse(professorId, { name, code, description }) {
    if (!name || name.trim().length < 3) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Course name must be at least 3 characters long.');
    }
    if (!code || code.trim().length < 2) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Course code is required (e.g. CS101).');
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await courseRepository.findByCode(cleanCode);
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Course code '${cleanCode}' already exists.`);
    }

    const course = await courseRepository.create({
      name: name.trim(),
      code: cleanCode,
      description: description ? description.trim() : '',
      professorId,
    });

    return course;
  }

  /**
   * Retrieve courses relevant to authenticated user
   * @param {object} user - { id, role }
   * @returns {Promise<Array>}
   */
  async getCoursesForUser(user) {
    if (user.role === 'STUDENT') {
      return await courseRepository.listEnrolledByStudent(user.id);
    }
    // Professor / Admin
    return await courseRepository.listByProfessor(user.id);
  }

  /**
   * List all system courses
   * @returns {Promise<Array>}
   */
  async getAllCourses() {
    return await courseRepository.listAll();
  }

  /**
   * Retrieve course details by ID
   * @param {string} courseId
   * @param {object} user
   * @returns {Promise<object>}
   */
  async getCourseById(courseId, user) {
    const course = await courseRepository.findByIdWithDetails(courseId);
    if (!course) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found.');
    }

    if (user.role === 'STUDENT') {
      const isEnrolled = await courseRepository.isStudentEnrolled(courseId, user.id);
      course.is_enrolled = isEnrolled;
    } else {
      course.is_instructor = course.professor_id === user.id;
    }

    return course;
  }

  /**
   * Update course
   * @param {string} courseId
   * @param {string} professorId
   * @param {object} param2
   * @returns {Promise<object>}
   */
  async updateCourse(courseId, professorId, { name, code, description }) {
    const existing = await courseRepository.findById(courseId);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found.');
    }

    // Ownership check
    if (existing.professor_id !== professorId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to modify this course.');
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      const duplicate = await courseRepository.findByCode(cleanCode);
      if (duplicate && duplicate.id !== courseId) {
        throw new ApiError(HTTP_STATUS.CONFLICT, `Course code '${cleanCode}' is already in use.`);
      }
    }

    const updated = await courseRepository.update(courseId, {
      name: name ? name.trim() : undefined,
      code: code ? code.trim().toUpperCase() : undefined,
      description: description !== undefined ? description.trim() : undefined,
    });

    return updated;
  }

  /**
   * Delete course
   * @param {string} courseId
   * @param {string} professorId
   * @returns {Promise<boolean>}
   */
  async deleteCourse(courseId, professorId) {
    const existing = await courseRepository.findById(courseId);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found.');
    }

    if (existing.professor_id !== professorId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this course.');
    }

    return await courseRepository.delete(courseId);
  }

  /**
   * Enroll a student into a course
   * @param {string} courseId
   * @param {object} param1
   * @param {string} [param1.studentId]
   * @param {string} [param1.email]
   * @returns {Promise<object>}
   */
  async enrollStudent(courseId, { studentId, email }) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found.');
    }

    let targetStudent = null;
    if (studentId) {
      targetStudent = await userRepository.findById(studentId);
    } else if (email) {
      targetStudent = await userRepository.findByEmail(email.toLowerCase().trim());
    }

    if (!targetStudent) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student account not found.');
    }
    if (targetStudent.role !== 'STUDENT') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only accounts with STUDENT role can be enrolled in courses.');
    }

    const enrollment = await courseRepository.enrollStudent(courseId, targetStudent.id);
    return {
      message: `Student '${targetStudent.name}' enrolled in course '${course.code}' successfully.`,
      enrollment,
      student: {
        id: targetStudent.id,
        name: targetStudent.name,
        email: targetStudent.email,
        studentId: targetStudent.student_id,
      },
    };
  }

  /**
   * List enrolled students for a course
   * @param {string} courseId
   * @returns {Promise<Array>}
   */
  async getEnrolledStudents(courseId) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found.');
    }
    return await courseRepository.listEnrolledStudents(courseId);
  }
}

module.exports = new CourseService();
