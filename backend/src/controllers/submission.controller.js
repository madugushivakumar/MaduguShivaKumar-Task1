const submissionService = require('../services/submission.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class SubmissionController {
  /**
   * POST /api/assignments/:id/submit
   * Submit an assignment (Individual or Group)
   */
  async submitAssignment(req, res, next) {
    try {
      const studentId = req.user.id;
      const assignmentId = req.params.id;
      const { submissionLink, submission_link, groupId, group_id } = req.body;

      const result = await submissionService.submitAssignment(studentId, assignmentId, {
        submissionLink: submissionLink || submission_link,
        groupId: groupId || group_id,
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result.submission,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/assignments/:id/acknowledge
   * Acknowledge an assignment submission.
   * Group assignments require leader credentials; non-leaders receive 403 Forbidden.
   */
  async acknowledgeAssignment(req, res, next) {
    try {
      const studentId = req.user.id;
      const assignmentId = req.params.id;
      const { groupId, group_id } = req.body;

      const result = await submissionService.acknowledgeAssignment(studentId, assignmentId, {
        groupId: groupId || group_id,
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result.submission,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/assignments/:id/status
   * Get submission & acknowledgment status for current student/group
   */
  async getStatus(req, res, next) {
    try {
      const studentId = req.user.id;
      const assignmentId = req.params.id;
      const groupId = req.query.groupId || req.query.group_id;

      const data = await submissionService.getAssignmentStatus(assignmentId, studentId, groupId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/assignments/:id/submissions
   * List all submissions for an assignment (Professor / Admin access)
   */
  async getSubmissionsForAssignment(req, res, next) {
    try {
      const assignmentId = req.params.id;
      const submissions = await submissionService.getSubmissionsForAssignment(assignmentId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          assignmentId,
          submissions,
          totalSubmissions: submissions.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/submissions/confirm
   * Legacy submission confirmation protocol (preserved for Round 1 backwards compatibility)
   */
  async confirmSubmission(req, res, next) {
    try {
      const studentId = req.user.id;
      const { assignmentId, groupId } = req.body;

      const result = await submissionService.confirmSubmission(studentId, {
        assignmentId,
        groupId,
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: {
          submission: result.submission,
          alreadyConfirmed: result.alreadyConfirmed,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/submissions/:assignmentId/:groupId
   * Legacy get submission status (preserved for Round 1 backwards compatibility)
   */
  async getSubmissionStatus(req, res, next) {
    try {
      const { assignmentId, groupId } = req.params;
      const studentId = req.user.id;

      const data = await submissionService.getSubmissionStatus(
        assignmentId,
        groupId,
        studentId
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SubmissionController();
