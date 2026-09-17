import api from './api';

export const groupService = {
  /**
   * List groups relevant to authenticated user
   */
  async getGroups() {
    const response = await api.get('/groups');
    return response.data;
  },

  /**
   * Get details of a specific group
   * @param {string} id
   */
  async getGroupById(id) {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  /**
   * Create a new group
   * @param {object} param0
   * @param {string} param0.name
   */
  async createGroup({ name }) {
    const response = await api.post('/groups', { name });
    return response.data;
  },

  /**
   * Add member to group by email and/or student ID
   * @param {string} groupId
   * @param {object} param1
   * @param {string} [param1.email]
   * @param {string} [param1.studentId]
   * @param {string} [param1.student_id]
   * @param {string} [param1.name]
   */
  async addMember(groupId, { email, studentId, student_id, name }) {
    const payload = {};
    if (email) payload.email = email;
    const resolvedId = studentId !== undefined ? studentId : student_id;
    if (resolvedId) payload.student_id = resolvedId;
    if (name) payload.name = name;

    const response = await api.post(`/groups/${groupId}/members`, payload);
    return response.data;
  },

  /**
   * List all members of a group
   * @param {string} groupId
   */
  async getMembers(groupId) {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  },

  /**
   * Remove a student from a group
   * @param {string} groupId
   * @param {string} studentId
   */
  async removeMember(groupId, studentId) {
    const response = await api.delete(`/groups/${groupId}/members/${studentId}`);
    return response.data;
  },
};

export default groupService;
