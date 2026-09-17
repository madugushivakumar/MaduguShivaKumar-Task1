const groupService = require('../services/group.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class GroupController {
  /**
   * POST /api/groups
   * Create a new group with the authenticated student as creator
   */
  async create(req, res, next) {
    try {
      const group = await groupService.createGroup({
        name: req.body.name,
        studentId: req.user.id,
      });

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Group created successfully.',
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/groups
   * List groups relevant to the authenticated user
   */
  async list(req, res, next) {
    try {
      const groups = await groupService.getGroupsForUser(req.user);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Groups retrieved successfully.',
        data: { groups, count: groups.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/groups/:id
   * Get details of a specific group
   */
  async getById(req, res, next) {
    try {
      const group = await groupService.getGroupDetails(req.params.id, req.user);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Group details retrieved successfully.',
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/groups/:groupId/members or /api/groups/:id/members
   * Add a student member to a group by email or student ID
   */
  async addMember(req, res, next) {
    try {
      const groupId = req.params.groupId || req.params.id;
      const result = await groupService.addMember(
        groupId,
        req.body,
        req.user
      );
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Student added to group successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/groups/:groupId/members or /api/groups/:id/members
   * List all members of a group
   */
  async listMembers(req, res, next) {
    try {
      const groupId = req.params.groupId || req.params.id;
      const members = await groupService.listMembers(groupId, req.user);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Group members retrieved successfully.',
        data: { members, count: members.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/groups/:groupId/members/:studentId or /api/groups/:id/members/:studentId
   * Remove a student from a group
   */
  async removeMember(req, res, next) {
    try {
      const groupId = req.params.groupId || req.params.id;
      const result = await groupService.removeMember(
        groupId,
        req.params.studentId,
        req.user
      );
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GroupController();
