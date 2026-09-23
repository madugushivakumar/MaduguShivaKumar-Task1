const submissionRepository = require('../repositories/submission.repository');
const assignmentRepository = require('../repositories/assignment.repository');
const groupRepository = require('../repositories/group.repository');
const courseRepository = require('../repositories/course.repository');
const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class SubmissionService {
  /**
   * Submit an assignment (Individual or Group)
   * @param {string} studentId - Authenticated student UUID
   * @param {string} assignmentId
   * @param {object} param2
   * @param {string} [param2.submissionLink]
   * @param {string} [param2.groupId]
   * @returns {Promise<object>}
   */
  async submitAssignment(studentId, assignmentId, { submissionLink, groupId = null } = {}) {
    if (!UUID_REGEX.test(assignmentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    if (assignment.submission_type === 'INDIVIDUAL') {
      // Verify student enrollment in course if course is attached
      if (assignment.course_id) {
        const isEnrolled = await courseRepository.isStudentEnrolled(assignment.course_id, studentId);
        if (!isEnrolled) {
          throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            'Access denied: You are not enrolled in the course offering this assignment.'
          );
        }
      }

      await submissionRepository.upsertSubmission({
        assignmentId,
        studentId,
        groupId: null,
        confirmedBy: studentId,
        status: 'SUBMITTED',
        isAcknowledged: false,
        submissionLink: submissionLink ? submissionLink.trim() : null,
      });

      const submission = await submissionRepository.getIndividualSubmissionWithDetails(
        assignmentId,
        studentId
      );

      return {
        success: true,
        message: 'Individual assignment submitted successfully.',
        submission,
      };
    }

    // GROUP Assignment Submission
    if (!groupId || !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'groupId is required for group assignment submission.');
    }

    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    const isMember = await submissionRepository.isStudentInGroup(groupId, studentId);
    if (!isMember) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Access denied: You are not a member of this group.');
    }

    const isAssigned = await submissionRepository.checkAssignmentAssignedToGroup(assignmentId, groupId);
    if (!isAssigned) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This assignment has not been allocated to your group.');
    }

    await submissionRepository.upsertSubmission({
      assignmentId,
      groupId,
      studentId: null,
      confirmedBy: studentId,
      status: 'SUBMITTED',
      isAcknowledged: false,
      submissionLink: submissionLink ? submissionLink.trim() : null,
    });

    const submission = await submissionRepository.getSubmissionWithDetails(assignmentId, groupId);

    return {
      success: true,
      message: `Group assignment submitted on behalf of ${group.name}.`,
      submission,
    };
  }

  /**
   * Acknowledge an assignment submission.
   * FOR GROUP ASSIGNMENTS: Enforces strict group leader authorization (group.created_by === studentId).
   * Non-leader group members receive HTTP 403 Forbidden.
   * @param {string} studentId - Authenticated student UUID
   * @param {string} assignmentId
   * @param {object} param2
   * @param {string} [param2.groupId]
   * @returns {Promise<object>}
   */
  async acknowledgeAssignment(studentId, assignmentId, { groupId = null } = {}) {
    if (!UUID_REGEX.test(assignmentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    if (assignment.submission_type === 'INDIVIDUAL') {
      if (assignment.course_id) {
        const isEnrolled = await courseRepository.isStudentEnrolled(assignment.course_id, studentId);
        if (!isEnrolled) {
          throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Access denied: You are not enrolled in this course.');
        }
      }

      await submissionRepository.upsertSubmission({
        assignmentId,
        studentId,
        groupId: null,
        confirmedBy: studentId,
        status: 'ACKNOWLEDGED',
        isAcknowledged: true,
        acknowledgedBy: studentId,
      });

      const submission = await submissionRepository.getIndividualSubmissionWithDetails(
        assignmentId,
        studentId
      );

      return {
        success: true,
        message: 'Assignment successfully acknowledged.',
        submission,
      };
    }

    // GROUP Assignment Acknowledgment
    if (!groupId || !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'groupId is required to acknowledge a group submission.');
    }

    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    // 1. Verify Student is a member of the group
    const isMember = await submissionRepository.isStudentInGroup(groupId, studentId);
    if (!isMember) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Access denied: You are not a member of this group.');
    }

    // 2. CRITICAL ROUND 2 REQUIREMENT: Enforce LEADER-ONLY acknowledgment
    const isLeader = group.created_by === studentId;
    if (!isLeader) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Access denied: Only the group leader can acknowledge group submissions.'
      );
    }

    // 3. Verify Assignment is allocated to this group
    const isAssigned = await submissionRepository.checkAssignmentAssignedToGroup(assignmentId, groupId);
    if (!isAssigned) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This assignment is not allocated to your group.');
    }

    // 4. Record acknowledgment
    await submissionRepository.upsertSubmission({
      assignmentId,
      groupId,
      studentId: null,
      confirmedBy: studentId,
      status: 'ACKNOWLEDGED',
      isAcknowledged: true,
      acknowledgedBy: studentId,
    });

    const submission = await submissionRepository.getSubmissionWithDetails(assignmentId, groupId);

    return {
      success: true,
      message: `Group submission for '${assignment.title}' successfully acknowledged by group leader.`,
      submission,
    };
  }

  /**
   * Get current submission & acknowledgment status for an assignment
   * @param {string} assignmentId
   * @param {string} studentId
   * @param {string} [groupId]
   * @returns {Promise<object>}
   */
  async getAssignmentStatus(assignmentId, studentId, groupId = null) {
    if (!UUID_REGEX.test(assignmentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    if (assignment.submission_type === 'INDIVIDUAL') {
      const submission = await submissionRepository.getIndividualSubmissionWithDetails(
        assignmentId,
        studentId
      );

      return {
        assignmentId,
        submissionType: 'INDIVIDUAL',
        status: submission?.status || 'PENDING',
        isAcknowledged: Boolean(submission?.is_acknowledged),
        submission: submission || null,
        isGroupLeader: false,
      };
    }

    // Group assignment
    let targetGroupId = groupId;
    if (!targetGroupId) {
      // Find first group this student belongs to that has this assignment
      const groups = await groupRepository.listGroupsForStudent(studentId);
      for (const g of groups) {
        const hasAssignment = await submissionRepository.checkAssignmentAssignedToGroup(assignmentId, g.id);
        if (hasAssignment) {
          targetGroupId = g.id;
          break;
        }
      }
    }

    if (!targetGroupId) {
      return {
        assignmentId,
        submissionType: 'GROUP',
        status: 'PENDING',
        isAcknowledged: false,
        submission: null,
        isGroupLeader: false,
      };
    }

    const group = await groupRepository.findById(targetGroupId);
    const submission = await submissionRepository.getSubmissionWithDetails(assignmentId, targetGroupId);

    return {
      assignmentId,
      groupId: targetGroupId,
      groupName: group?.name,
      submissionType: 'GROUP',
      status: submission?.status || 'PENDING',
      isAcknowledged: Boolean(submission?.is_acknowledged),
      isGroupLeader: group?.created_by === studentId,
      groupLeaderId: group?.created_by,
      submission: submission || null,
    };
  }

  /**
   * List all submissions for an assignment (Professor / Admin view)
   * @param {string} assignmentId
   * @returns {Promise<Array>}
   */
  async getSubmissionsForAssignment(assignmentId) {
    if (!UUID_REGEX.test(assignmentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment UUID format.');
    }

    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    return await submissionRepository.listByAssignment(assignmentId);
  }

  /**
   * Legacy Round 1 confirmSubmission method (preserved 100% for backwards compatibility)
   * @param {string} studentId
   * @param {object} param1
   * @returns {Promise<object>}
   */
  async confirmSubmission(studentId, { assignmentId, groupId }) {
    if (!UUID_REGEX.test(assignmentId) || !UUID_REGEX.test(groupId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid assignment or group UUID format.');
    }

    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    const isMember = await submissionRepository.isStudentInGroup(groupId, studentId);
    if (!isMember) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Access denied: You are not a registered member of this group.'
      );
    }

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

    const existing = await submissionRepository.findByAssignmentAndGroup({
      assignmentId,
      groupId,
    });

    if (existing && (existing.status === 'CONFIRMED' || existing.status === 'ACKNOWLEDGED')) {
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

    const isLeader = group.created_by === studentId;

    await submissionRepository.upsertSubmission({
      assignmentId,
      groupId,
      confirmedBy: studentId,
      status: 'CONFIRMED',
      isAcknowledged: isLeader,
      acknowledgedBy: isLeader ? studentId : null,
    });

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
   * Legacy Round 1 getSubmissionStatus (preserved 100% for backwards compatibility)
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
