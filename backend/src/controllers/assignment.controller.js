const assignmentService = require('../services/assignment.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class AssignmentController {
  /**
   * POST /api/assignments
   * Create assignment (Admin only)
   */
  async createAssignment(req, res, next) {
    try {
      const adminId = req.user.id;
      const assignment = await assignmentService.createAssignment(adminId, req.body);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: `Assignment '${assignment.title}' created successfully.`,
        data: { assignment },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/assignments
   * List all managed assignments (Admin / Professor only)
   */
  async getAssignments(req, res, next) {
    try {
      const { courseId, course_id, submissionType, submission_type } = req.query;
      const assignments = await assignmentService.listAssignments({
        courseId: courseId || course_id,
        submissionType: submissionType || submission_type,
      });
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Assignments retrieved successfully.',
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
   * GET /api/assignments/student
   * Get assignments allocated to groups or courses that the student is enrolled in
   */
  async getStudentAssignments(req, res, next) {
    try {
      const studentId = req.user.id;
      const { courseId, course_id } = req.query;
      const assignments = await assignmentService.getAssignmentsForStudent(studentId, {
        courseId: courseId || course_id,
      });
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Student coursework retrieved successfully.',
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
   * GET /api/assignments/student/:id
   * Get specific assignment details for authenticated student (only if assigned to their group)
   */
  async getStudentAssignmentById(req, res, next) {
    try {
      const studentId = req.user.id;
      const { id } = req.params;
      const { groupId } = req.query;
      const assignment = await assignmentService.getStudentAssignmentById(id, studentId, groupId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Student assignment details retrieved successfully.',
        data: { assignment },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/assignments/:id
   * Get detailed metadata and assigned groups for a specific assignment
   */
  async getAssignmentById(req, res, next) {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.getAssignmentById(id, req.user);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Assignment details retrieved successfully.',
        data: { assignment },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/assignments/:id
   * Update an assignment (Admin only)
   */
  async updateAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.updateAssignment(id, req.user, req.body);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Assignment '${assignment.title}' updated successfully.`,
        data: { assignment },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/assignments/:id/groups
   * Allocate assignment to specific groups (Admin only)
   */
  async assignToGroups(req, res, next) {
    try {
      const { id } = req.params;
      const { groupIds } = req.body;
      const result = await assignmentService.assignToGroups(id, groupIds);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Assignment allocated to specified groups successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/assignments/:id/assign-all
   * Allocate assignment to all groups in the system (Admin only)
   */
  async assignToAllGroups(req, res, next) {
    try {
      const { id } = req.params;
      const result = await assignmentService.assignToAllGroups(id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Assignment allocated to all groups successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/assignments/:id
   * Delete an assignment (Faculty/Admin only)
   */
  async deleteAssignment(req, res, next) {
    try {
      const { id } = req.params;
      await assignmentService.deleteAssignment(id, req.user);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Assignment deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AssignmentController();
