const progressService = require('../services/progress.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class ProgressController {
  /**
   * GET /api/groups/:id/progress
   * Calculate group progress based on assignments assigned to that group
   */
  async getGroupProgress(req, res, next) {
    try {
      const id = req.params.groupId || req.params.id;
      const progress = await progressService.getGroupProgress(id, req.user);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Group progress retrieved successfully.',
        data: progress,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/dashboard/summary
   * System-wide progress and statistics overview
   */
  async getAdminDashboardSummary(req, res, next) {
    try {
      const summary = await progressService.getAdminDashboardSummary();
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Admin dashboard summary retrieved successfully.',
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/groups
   * List all groups with progress metrics and filters
   */
  async getAdminGroups(req, res, next) {
    try {
      const { search, status } = req.query;
      const groups = await progressService.getAdminGroups(search, status);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Admin groups list retrieved successfully.',
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
   * GET /api/admin/groups/:id
   * Detailed group information, members roster, and assigned coursework status
   */
  async getAdminGroupDetails(req, res, next) {
    try {
      const { id } = req.params;
      const details = await progressService.getAdminGroupDetails(id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Group details and coursework status retrieved successfully.',
        data: details,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/submissions
   * Overview of submissions filterable by assignment, group, or search
   */
  async getAllSubmissions(req, res, next) {
    try {
      const { assignmentId, groupId, search } = req.query;
      const tracking = await progressService.getStudentWiseTracking({
        assignmentId,
        groupId,
        search,
      });
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Submissions monitoring data retrieved successfully.',
        data: {
          count: tracking.length,
          submissions: tracking,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/submissions/assignment/:assignmentId
   * Assignment-wise submission progress and group roster
   */
  async getAssignmentWiseSubmissions(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const data = await progressService.getAssignmentWiseSubmissions(assignmentId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Assignment submissions retrieved successfully.',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/submissions/group/:groupId
   * Group-wise submission progress and coursework roster
   */
  async getGroupWiseSubmissions(req, res, next) {
    try {
      const { groupId } = req.params;
      const data = await progressService.getGroupWiseSubmissions(groupId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Group submissions retrieved successfully.',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/submissions/student-wise
   * Student-wise submission confirmation tracking
   */
  async getStudentWiseSubmissions(req, res, next) {
    try {
      const { assignmentId, groupId, search } = req.query;
      const tracking = await progressService.getStudentWiseTracking({
        assignmentId,
        groupId,
        search,
      });
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Student-wise submission tracking retrieved successfully.',
        data: {
          count: tracking.length,
          records: tracking,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProgressController();
