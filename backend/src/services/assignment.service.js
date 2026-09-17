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
    const { title, description, dueDate, onedriveLink, groupIds, assignAll } = payload;

    const assignment = await assignmentRepository.createWithTransaction({
      title,
      description,
      dueDate,
      onedriveLink,
      createdBy: adminId,
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

    // If a student is viewing, verify they are in one of the assigned groups
    if (user && user.role === 'STUDENT') {
      const studentAssignments = await assignmentRepository.findAssignmentsForStudent(user.id);
      const isAssigned = studentAssignments.some((a) => a.id === id);
      if (!isAssigned) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'Access denied: This assignment has not been allocated to your groups.'
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
  async updateAssignment(id, adminId, updates) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const existing = await assignmentRepository.findByIdWithDetails(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    await assignmentRepository.update(id, updates);
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
      const updatedDetails = await assignmentRepository.findByIdWithDetails(id);
      return {
        ...result,
        assignedGroups: updatedDetails.assigned_groups,
        totalAssigned: updatedDetails.assigned_groups_count,
      };
    } catch (err) {
      if (err.message && err.message.includes('do not exist')) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, err.message);
      }
      throw err;
    }
  }

  /**
   * Assign an assignment to all groups in the system
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
    const updatedDetails = await assignmentRepository.findByIdWithDetails(id);
    return {
      ...result,
      assignedGroups: updatedDetails.assigned_groups,
      totalAssigned: updatedDetails.assigned_groups_count,
    };
  }

  /**
   * Get assignments allocated to groups that the authenticated student belongs to
   * @param {string} studentId
   * @returns {Promise<Array>}
   */
  async getAssignmentsForStudent(studentId) {
    return assignmentRepository.findAssignmentsForStudent(studentId);
  }

  /**
   * Get assignment details for a student if allocated to one of their groups
   * @param {string} assignmentId
   * @param {string} studentId
   * @param {string} [groupId]
   * @returns {Promise<object>}
   */
  async getStudentAssignmentById(assignmentId, studentId, groupId = null) {
    if (!assignmentId || !UUID_REGEX.test(assignmentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }
    if (groupId && !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid group UUID format.');
    }

    const assignment = await assignmentRepository.findStudentAssignmentById(assignmentId, studentId, groupId);
    if (!assignment) {
      // Check if assignment exists at all
      const exists = await assignmentRepository.findByIdWithDetails(assignmentId);
      if (!exists) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
      }
      // If assignment exists, student is not authorized/allocated to it
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have access to this assignment. It has not been assigned to any of your groups.'
      );
    }

    return assignment;
  }

  /**
   * List all managed assignments for admins
   * @returns {Promise<Array>}
   */
  async listAssignments() {
    return assignmentRepository.listManagedAssignments();
  }

  /**
   * Delete an assignment
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteAssignment(id) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const existing = await assignmentRepository.findByIdWithDetails(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    return assignmentRepository.delete(id);
  }
}

module.exports = new AssignmentService();
