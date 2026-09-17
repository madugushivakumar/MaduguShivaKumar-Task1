const analyticsRepository = require('../repositories/analytics.repository');

class AnalyticsService {
  /**
   * Get system-wide overview metrics
   * @returns {Promise<object>}
   */
  async getOverview() {
    return analyticsRepository.getOverview();
  }

  /**
   * Get assignment completion analytics
   * @param {object} [filters]
   * @returns {Promise<Array>}
   */
  async getAssignmentAnalytics(filters = {}) {
    return analyticsRepository.getAssignmentAnalytics(filters);
  }

  /**
   * Get group performance analytics
   * @param {object} [filters]
   * @returns {Promise<Array>}
   */
  async getGroupAnalytics(filters = {}) {
    return analyticsRepository.getGroupAnalytics(filters);
  }

  /**
   * Get recent submissions
   * @param {object} [options]
   * @returns {Promise<Array>}
   */
  async getRecentSubmissions(options = {}) {
    return analyticsRepository.getRecentSubmissions(options);
  }
}

module.exports = new AnalyticsService();
