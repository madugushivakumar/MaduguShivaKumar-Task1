const healthRepository = require('../repositories/health.repository');
const { env } = require('../config/env.config');

class HealthService {
  /**
   * Basic application health check
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async getApiHealth() {
    return {
      success: true,
      message: 'Joineazy API is running',
    };
  }

  /**
   * Detailed application health check including database status
   * @returns {Promise<object>}
   */
  async getDetailedHealth() {
    const dbStatus = await healthRepository.checkDatabaseHealth();
    return {
      success: true,
      message: 'Joineazy API is running',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        database: dbStatus.connected ? 'connected' : 'disconnected',
        dbLatencyMs: dbStatus.latencyMs,
      },
    };
  }
}

module.exports = new HealthService();
