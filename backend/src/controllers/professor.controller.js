const professorService = require('../services/professor.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class ProfessorController {
  async getDashboard(req, res, next) {
    try {
      const professorId = req.user.id;
      const data = await professorService.getProfessorDashboard(professorId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCourseAnalytics(req, res, next) {
    try {
      const data = await professorService.getCourseAnalytics(req.params.id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAssignmentProgress(req, res, next) {
    try {
      const data = await professorService.getAssignmentProgress(req.params.id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfessorController();
