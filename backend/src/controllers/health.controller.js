const healthService = require('../services/health.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class HealthController {
  /**
   * GET /api/health
   * Standard health check endpoint
   */
  async getHealth(req, res, next) {
    try {
      const result = await healthService.getApiHealth();
      return res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/health/details
   * Diagnostic health check with DB status
   */
  async getDetailedHealth(req, res, next) {
    try {
      const result = await healthService.getDetailedHealth();
      return res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthController();
