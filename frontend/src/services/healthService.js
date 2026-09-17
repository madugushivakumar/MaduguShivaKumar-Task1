import api from './api';

export const healthService = {
  /**
   * Basic health check
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async getHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  /**
   * Detailed health check including database status
   * @returns {Promise<object>}
   */
  async getDetailedHealth() {
    const response = await api.get('/health/details');
    return response.data;
  },
};

export default healthService;
