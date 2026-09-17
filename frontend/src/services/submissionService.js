import api from './api';

export const submissionService = {
  /**
   * Get coursework allocated to groups that the student belongs to,
   * including submission status and confirmation details
   */
  async getStudentAssignments() {
    const response = await api.get('/assignments/student');
    return response.data;
  },

  /**
   * Get specific assignment details for student with submission status
   * @param {string} id - Assignment UUID
   * @param {string} [groupId] - Optional Group UUID
   */
  async getStudentAssignmentById(id, groupId = null) {
    const url = groupId
      ? `/assignments/student/${id}?groupId=${encodeURIComponent(groupId)}`
      : `/assignments/student/${id}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Confirm assignment submission on behalf of the project group
   * Dispatches the 2-step verified confirmation payload
   * @param {string} assignmentId
   * @param {string} groupId
   */
  async confirmSubmission(assignmentId, groupId) {
    const response = await api.post('/submissions/confirm', {
      assignment_id: assignmentId,
      group_id: groupId,
    });
    return response.data;
  },

  /**
   * Query submission status for an assignment and group
   * @param {string} assignmentId
   * @param {string} groupId
   */
  async getSubmissionStatus(assignmentId, groupId) {
    const response = await api.get(`/submissions/${assignmentId}/${groupId}`);
    return response.data;
  },
};

export default submissionService;
