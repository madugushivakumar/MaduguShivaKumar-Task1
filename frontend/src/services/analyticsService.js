import api from './api';

export const analyticsService = {
  /**
   * Get system-wide analytics overview counts and completion rates
   */
  async getOverview() {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  /**
   * Get per-assignment completion metrics
   * @param {object} [params]
   * @param {string} [params.search]
   */
  async getAssignments(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get(`/analytics/assignments${qs}`);
    return response.data;
  },

  /**
   * Get per-group performance metrics
   * @param {object} [params]
   * @param {string} [params.search]
   */
  async getGroups(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get(`/analytics/groups${qs}`);
    return response.data;
  },

  /**
   * Get recent submissions
   * @param {object} [params]
   * @param {number} [params.limit]
   * @param {string} [params.assignmentId]
   * @param {string} [params.groupId]
   * @param {string} [params.status]
   */
  async getRecentSubmissions(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.assignmentId) query.append('assignmentId', params.assignmentId);
    if (params.groupId) query.append('groupId', params.groupId);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get(`/analytics/recent-submissions${qs}`);
    return response.data;
  },
};

export default analyticsService;
