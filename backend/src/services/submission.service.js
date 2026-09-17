const submissionRepository = require('../repositories/submission.repository');
const assignmentRepository = require('../repositories/assignment.repository');
const groupRepository = require('../repositories/group.repository');
const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class SubmissionService {
  /**
   * Confirm assignment submission on behalf of the student's project group
   * @param {string} studentId - UUID of the authenticated student committing confirmation
   * @param {object} param1
   * @param {string} param1.assignmentId
   * @param {string} param1.groupId
   * @returns {Promise<object>}
   */
  async confirmSubmission(studentId, { assignmentId, groupId }) {
    if (!UUID_REGEX.test(assignmentId) || !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment or group UUID format.');
    }

    // 1. Verify Assignment exists
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    // 2. Verify Group exists
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    // 3. Verify Student is an active member of the group
    const isMember = await submissionRepository.isStudentInGroup(groupId, studentId);
    if (!isMember) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Access denied: You are not a registered member of this group.'
      );
    }

    // 4. Verify Assignment is allocated to this group
    const isAssigned = await submissionRepository.checkAssignmentAssignedToGroup(
      assignmentId,
      groupId
    );
    if (!isAssigned) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'This assignment has not been allocated to the specified group.'
      );
    }

    // 5. Check if already confirmed (Idempotency)
    const existing = await submissionRepository.findByAssignmentAndGroup({
      assignmentId,
      groupId,
    });

    if (existing && existing.status === 'CONFIRMED') {
      const richDetails = await submissionRepository.getSubmissionWithDetails(
        assignmentId,
        groupId
      );
      return {
        submission: richDetails || existing,
        alreadyConfirmed: true,
        message: 'Submission already confirmed for this group.',
      };
    }

    // 6. Record or update submission to CONFIRMED
    await submissionRepository.upsertSubmission({
      assignmentId,
      groupId,
      confirmedBy: studentId,
      status: 'CONFIRMED',
    });

    // 7. Retrieve hydrated record with confirming student and group names
    const hydratedSubmission = await submissionRepository.getSubmissionWithDetails(
      assignmentId,
      groupId
    );

    return {
      submission: hydratedSubmission,
      alreadyConfirmed: false,
      message: 'Assignment submission successfully confirmed.',
    };
  }

  /**
   * Retrieve submission status for an assignment and group
   * @param {string} assignmentId
   * @param {string} groupId
   * @param {string} studentId
   * @returns {Promise<object>}
   */
  async getSubmissionStatus(assignmentId, groupId, studentId) {
    if (!UUID_REGEX.test(assignmentId) || !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment or group UUID format.');
    }

    const isMember = await submissionRepository.isStudentInGroup(groupId, studentId);
    if (!isMember) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Access denied: You are not a member of this group.'
      );
    }

    const submission = await submissionRepository.getSubmissionWithDetails(
      assignmentId,
      groupId
    );

    return {
      assignmentId,
      groupId,
      status: submission?.status || 'PENDING',
      submission: submission || null,
    };
  }
}

module.exports = new SubmissionService();
