const analyticsService = require('../services/analytics.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class AnalyticsController {
  /**
   * GET /api/analytics/overview
   * Retrieve system-wide analytics overview counts and completion rates
   */
  async getOverview(req, res, next) {
    try {
      const overview = await analyticsService.getOverview();
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Analytics overview retrieved successfully.',
        data: overview,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/analytics/assignments
   * Retrieve per-assignment completion metrics across assigned groups
   */
  async getAssignments(req, res, next) {
    try {
      const { search } = req.query;
      const assignments = await analyticsService.getAssignmentAnalytics({ search });
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Assignment completion analytics retrieved successfully.',
        data: {
          count: assignments.length,
          assignments,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/analytics/groups
   * Retrieve per-group performance metrics across assigned coursework
   */
  async getGroups(req, res, next) {
    try {
      const { search } = req.query;
      const groups = await analyticsService.getGroupAnalytics({ search });
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Group performance analytics retrieved successfully.',
        data: {
          count: groups.length,
          groups,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/analytics/recent-submissions
   * Retrieve recent confirmed submissions for the dashboard summary table
   */
  async getRecentSubmissions(req, res, next) {
    try {
      const { limit, assignmentId, groupId, status } = req.query;
      const submissions = await analyticsService.getRecentSubmissions({
        limit: limit ? parseInt(limit, 10) : 10,
        assignmentId,
        groupId,
        status,
      });
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Recent submissions retrieved successfully.',
        data: {
          count: submissions.length,
          submissions,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
