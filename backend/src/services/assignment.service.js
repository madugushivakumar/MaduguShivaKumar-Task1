const { query } = require('../config/db.config');
const assignmentRepository = require('../repositories/assignment.repository');
const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class AssignmentService {
  /**
   * Create a new assignment with optional atomic initial allocation
   * @param {string} adminId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async createAssignment(adminId, payload) {
    const {
      title,
      description,
      dueDate,
      onedriveLink,
      courseId,
      course_id,
      submissionType,
      submission_type,
      groupIds,
      assignAll,
    } = payload;

    const assignment = await assignmentRepository.createWithTransaction({
      title,
      description,
      dueDate,
      onedriveLink,
      createdBy: adminId,
      courseId: courseId || course_id || null,
      submissionType: submissionType || submission_type || 'GROUP',
      groupIds,
      assignAll,
    });

    return assignment;
  }

  /**
   * Get an assignment by ID with assigned group details
   * @param {string} id
   * @param {object} user - Authenticated user from JWT
   * @returns {Promise<object>}
   */
  async getAssignmentById(id, user) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const assignment = await assignmentRepository.findByIdWithDetails(id);
    if (!assignment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    // If a student is viewing, verify they are authorized (enrolled in course or assigned in group)
    if (user && user.role === 'STUDENT') {
      const studentAssignments = await assignmentRepository.findAssignmentsForStudent(user.id);
      const isAssigned = studentAssignments.some((a) => a.id === id);
      if (!isAssigned) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'Access denied: This assignment has not been allocated to your groups or enrolled courses.'
        );
      }
    }

    return assignment;
  }

  /**
   * Update an existing assignment
   * @param {string} id
   * @param {string} adminId
   * @param {object} updates
   * @returns {Promise<object>}
   */
  async updateAssignment(id, userOrId, updates) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const existing = await assignmentRepository.findByIdWithDetails(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    const userId = typeof userOrId === 'object' ? userOrId.id : userOrId;
    const userRole = typeof userOrId === 'object' ? userOrId.role : 'ADMIN';

    // RBAC: If caller is PROFESSOR, they can only edit their own assignments or assignments in their courses
    if (userRole === 'PROFESSOR') {
      const isCreator = existing.created_by === userId;
      let teachesCourse = false;
      if (existing.course_id) {
        const courseRes = await query('SELECT professor_id FROM courses WHERE id = $1', [existing.course_id]);
        if (courseRes.rows.length > 0 && courseRes.rows[0].professor_id === userId) {
          teachesCourse = true;
        }
      }
      if (!isCreator && !teachesCourse) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'Access denied: You are not authorized to edit assignments belonging to other faculty.'
        );
      }
    }

    await assignmentRepository.update(id, {
      title: updates.title,
      description: updates.description,
      dueDate: updates.dueDate,
      onedriveLink: updates.onedriveLink,
      courseId: updates.courseId || updates.course_id,
      submissionType: updates.submissionType || updates.submission_type,
    });

    const refreshed = await assignmentRepository.findByIdWithDetails(id);
    return refreshed;
  }

  /**
   * Assign an assignment to specific groups
   * @param {string} id
   * @param {Array<string>} groupIds
   * @returns {Promise<object>}
   */
  async assignToGroups(id, groupIds) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const existing = await assignmentRepository.findByIdWithDetails(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    try {
      const result = await assignmentRepository.assignToGroups(id, groupIds);
      return result;
    } catch (err) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, err.message);
    }
  }

  /**
   * Assign an assignment to all eligible groups
   * @param {string} id
   * @returns {Promise<object>}
   */
  async assignToAllGroups(id) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const existing = await assignmentRepository.findByIdWithDetails(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    const result = await assignmentRepository.assignToAllGroups(id);
    return result;
  }

  /**
   * Delete an assignment
   * @param {string} id
   * @param {object|string} [userOrId]
   * @returns {Promise<boolean>}
   */
  async deleteAssignment(id, userOrId = null) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const existing = await assignmentRepository.findByIdWithDetails(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    if (userOrId) {
      const userId = typeof userOrId === 'object' ? userOrId.id : userOrId;
      const userRole = typeof userOrId === 'object' ? userOrId.role : 'ADMIN';

      // RBAC: If caller is PROFESSOR, they can only delete their own assignments or assignments in their courses
      if (userRole === 'PROFESSOR') {
        const isCreator = existing.created_by === userId;
        let teachesCourse = false;
        if (existing.course_id) {
          const courseRes = await query('SELECT professor_id FROM courses WHERE id = $1', [existing.course_id]);
          if (courseRes.rows.length > 0 && courseRes.rows[0].professor_id === userId) {
            teachesCourse = true;
          }
        }
        if (!isCreator && !teachesCourse) {
          throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            'Access denied: You are not authorized to delete assignments belonging to other faculty.'
          );
        }
      }
    }

    const deleted = await assignmentRepository.delete(id);
    if (!deleted) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found or already deleted.');
    }
    return deleted;
  }

  /**
   * List all managed assignments with optional filters
   * @param {object} [filters]
   * @returns {Promise<Array>}
   */
  async listAssignments(filters = {}) {
    return await assignmentRepository.listManagedAssignments(filters);
  }

  /**
   * Get coursework feed for a student
   * @param {string} studentId
   * @param {object} [filters]
   * @returns {Promise<Array>}
   */
  async getAssignmentsForStudent(studentId, filters = {}) {
    return await assignmentRepository.findAssignmentsForStudent(studentId, filters);
  }

  /**
   * Get specific coursework details for a student
   * @param {string} assignmentId
   * @param {string} studentId
   * @param {string} [groupId]
   * @returns {Promise<object>}
   */
  async getStudentAssignmentById(assignmentId, studentId, groupId = null) {
    if (!assignmentId || !UUID_REGEX.test(assignmentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const assignment = await assignmentRepository.findStudentAssignmentById(
      assignmentId,
      studentId,
      groupId
    );

    if (!assignment) {
      const basic = await assignmentRepository.findById(assignmentId);
      if (!basic) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
      }
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Access denied: You do not have access to this coursework.'
      );
    }

    return assignment;
  }
}

module.exports = new AssignmentService();
