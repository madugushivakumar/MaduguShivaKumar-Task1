import api from './api';

export const progressService = {
  /**
   * Get assignment completion progress for a group
   * @param {string} groupId
   */
  async getGroupProgress(groupId) {
    const response = await api.get(`/groups/${groupId}/progress`);
    return response.data;
  },

  /**
   * Get system-wide statistics summary for the admin dashboard
   */
  async getAdminDashboardSummary() {
    const response = await api.get('/admin/dashboard/summary');
    return response.data;
  },

  /**
   * Get all groups with progress metrics for admin monitoring
   * @param {object} params
   * @param {string} [params.search]
   * @param {string} [params.status]
   */
  async getAdminGroups(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get(`/admin/groups${qs}`);
    return response.data;
  },

  /**
   * Get detailed group metadata, members roster, and assigned coursework status
   * @param {string} groupId
   */
  async getAdminGroupDetails(groupId) {
    const response = await api.get(`/admin/groups/${groupId}`);
    return response.data;
  },

  /**
   * Get assignment-wise submission monitoring data
   * @param {string} assignmentId
   */
  async getAssignmentSubmissions(assignmentId) {
    const response = await api.get(`/admin/submissions/assignment/${assignmentId}`);
    return response.data;
  },

  /**
   * Get group-wise submission monitoring data
   * @param {string} groupId
   */
  async getGroupSubmissions(groupId) {
    const response = await api.get(`/admin/submissions/group/${groupId}`);
    return response.data;
  },

  /**
   * Get student-wise submission confirmation tracking
   * @param {object} params
   * @param {string} [params.assignmentId]
   * @param {string} [params.groupId]
   * @param {string} [params.search]
   */
  async getStudentWiseSubmissions(params = {}) {
    const query = new URLSearchParams();
    if (params.assignmentId) query.append('assignmentId', params.assignmentId);
    if (params.groupId) query.append('groupId', params.groupId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get(`/admin/submissions/student-wise${qs}`);
    return response.data;
  },

  /**
   * Get all system submissions overview
   * @param {object} params
   */
  async getAllSubmissions(params = {}) {
    const query = new URLSearchParams();
    if (params.assignmentId) query.append('assignmentId', params.assignmentId);
    if (params.groupId) query.append('groupId', params.groupId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get(`/admin/submissions${qs}`);
    return response.data;
  },
};

export default progressService;
