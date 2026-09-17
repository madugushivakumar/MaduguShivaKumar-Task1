const progressRepository = require('../repositories/progress.repository');
const submissionRepository = require('../repositories/submission.repository');
const groupRepository = require('../repositories/group.repository');
const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ProgressService {
  /**
   * Retrieve group assignment progress with authorization check
   * @param {string} groupId
   * @param {object} user - Authenticated user { id, role }
   * @returns {Promise<object>}
   */
  async getGroupProgress(groupId, user) {
    if (!groupId || !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid group UUID format.');
    }

    // Authorization: Students can ONLY view progress for groups they belong to
    if (user.role === 'STUDENT') {
      const isMember = await submissionRepository.isStudentInGroup(groupId, user.id);
      if (!isMember) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'Access denied: You are not authorized to view progress for this group.'
        );
      }
    }

    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    const progress = await progressRepository.getGroupProgress(groupId);
    return progress || {
      groupId,
      groupName: group.name,
      memberCount: 0,
      totalAssignments: 0,
      completedAssignments: 0,
      pendingAssignments: 0,
      progressPercentage: 0,
    };
  }

  /**
   * List all groups with progress metrics for admin monitoring
   * @param {string|null} search
   * @param {string|null} statusFilter
   * @returns {Promise<Array>}
   */
  async getAdminGroups(search = null, statusFilter = null) {
    let groups = await progressRepository.getAllGroupsProgress(search);

    if (statusFilter && statusFilter !== 'ALL') {
      groups = groups.filter((g) => g.status === statusFilter.toUpperCase());
    }

    return groups;
  }

  /**
   * Retrieve detailed group information, member roster, and assigned coursework status
   * @param {string} groupId
   * @returns {Promise<object>}
   */
  async getAdminGroupDetails(groupId) {
    if (!groupId || !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid group UUID format.');
    }

    const details = await progressRepository.getGroupDetailsWithCoursework(groupId);
    if (!details) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    return details;
  }

  /**
   * Retrieve system-wide statistics summary for the admin dashboard
   * @returns {Promise<object>}
   */
  async getAdminDashboardSummary() {
    return progressRepository.getAdminDashboardSummary();
  }

  /**
   * Retrieve assignment-wise submission monitoring data
   * @param {string} assignmentId
   * @returns {Promise<object>}
   */
  async getAssignmentWiseSubmissions(assignmentId) {
    if (!assignmentId || !UUID_REGEX.test(assignmentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const data = await progressRepository.getAssignmentWiseMonitoring(assignmentId);
    if (!data) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    return data;
  }

  /**
   * Retrieve group-wise submission monitoring data
   * @param {string} groupId
   * @returns {Promise<object>}
   */
  async getGroupWiseSubmissions(groupId) {
    if (!groupId || !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid group UUID format.');
    }

    const data = await progressRepository.getGroupDetailsWithCoursework(groupId);
    if (!data) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    return data;
  }

  /**
   * Retrieve student-wise confirmation tracking matrix
   * Distinguishes between group status and the individual student who performed confirmation
   * @param {object} param0
   * @param {string|null} param0.assignmentId
   * @param {string|null} param0.groupId
   * @param {string|null} param0.search
   * @returns {Promise<Array>}
   */
  async getStudentWiseTracking({ assignmentId = null, groupId = null, search = null }) {
    if (assignmentId && !UUID_REGEX.test(assignmentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }
    if (groupId && !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid group UUID format.');
    }

    return progressRepository.getStudentWiseSubmissionTracking({
      assignmentId,
      groupId,
      search,
    });
  }
}

module.exports = new ProgressService();
