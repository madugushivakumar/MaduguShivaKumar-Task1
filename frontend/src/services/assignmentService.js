import api from './api';

export const assignmentService = {
  /**
   * List all managed assignments (Admin/Professor)
   * @param {object} [params] - Optional query filters (course_id, submission_type)
   */
  async getAssignments(params = {}) {
    const response = await api.get('/assignments', { params });
    return response.data;
  },

  /**
   * Get assignment details by ID with assigned group roster
   * @param {string} id
   */
  async getAssignmentById(id) {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  /**
   * Create a new assignment with optional initial allocation
   * @param {object} data
   */
  async createAssignment(data) {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  /**
   * Update assignment details
   * @param {string} id
   * @param {object} data
   */
  async updateAssignment(id, data) {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },

  /**
   * Allocate assignment to specific groups
   * @param {string} id
   * @param {Array<string>} groupIds
   */
  async assignToGroups(id, groupIds) {
    const response = await api.post(`/assignments/${id}/groups`, { group_ids: groupIds });
    return response.data;
  },

  /**
   * Allocate assignment to all eligible groups in the system
   * @param {string} id
   */
  async assignToAllGroups(id) {
    const response = await api.post(`/assignments/${id}/assign-all`);
    return response.data;
  },

  /**
   * Get coursework allocated to groups that the student belongs to
   */
  async getStudentAssignments() {
    const response = await api.get('/assignments/student');
    return response.data;
  },

  /**
   * Delete an assignment (Admin)
   * @param {string} id
   */
  async deleteAssignment(id) {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },
};

export default assignmentService;
