const { pool } = require('../config/db.config');

class HealthRepository {
  /**
   * Check database connectivity via SQL query
   * @returns {Promise<{connected: boolean, latencyMs: number}>}
   */
  async checkDatabaseHealth() {
    const start = Date.now();
    try {
      const client = await pool.connect();
      await client.query('SELECT 1 AS status');
      client.release();
      const latencyMs = Date.now() - start;
      return { connected: true, latencyMs };
    } catch (error) {
      return { connected: false, latencyMs: -1, error: error.message };
    }
  }
}

module.exports = new HealthRepository();
