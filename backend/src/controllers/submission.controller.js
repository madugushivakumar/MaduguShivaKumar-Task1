const submissionService = require('../services/submission.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class SubmissionController {
  /**
   * POST /api/submissions/confirm
   * Formal submission confirmation protocol by an enrolled student
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
   * Get current submission status
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
