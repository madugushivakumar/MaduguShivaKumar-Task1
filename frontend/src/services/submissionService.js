import api from './api';

export const submissionService = {
  /**
   * Get coursework allocated to groups or student,
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
   * Submit assignment coursework (Individual or Group)
   * @param {string} assignmentId
   * @param {object} data - { groupId, submissionLink, submissionText }
   */
  async submitAssignment(assignmentId, data = {}) {
    const response = await api.post(`/assignments/${assignmentId}/submit`, {
      group_id: data.groupId || null,
      submission_link: data.submissionLink || '',
      submission_text: data.submissionText || '',
    });
    return response.data;
  },

  /**
   * Acknowledge group or individual submission.
   * NOTE: For group assignments, ONLY group leader is authorized!
   * @param {string} assignmentId
   * @param {string} [groupId]
   */
  async acknowledgeAssignment(assignmentId, groupId = null) {
    const response = await api.post(`/assignments/${assignmentId}/acknowledge`, {
      group_id: groupId || null,
    });
    return response.data;
  },

  /**
   * Query status for assignment (checks acknowledgment, submission, isGroupLeader)
   * @param {string} assignmentId
   * @param {string} [groupId]
   */
  async getStatus(assignmentId, groupId = null) {
    const url = groupId
      ? `/assignments/${assignmentId}/status?groupId=${encodeURIComponent(groupId)}`
      : `/assignments/${assignmentId}/status`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * View all submissions for an assignment (Professor / Admin)
   * @param {string} assignmentId
   */
  async getSubmissionsForAssignment(assignmentId) {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  /**
   * View progress breakdown for an assignment
   * @param {string} assignmentId
   */
  async getAssignmentProgress(assignmentId) {
    const response = await api.get(`/assignments/${assignmentId}/progress`);
    return response.data;
  },

  /**
   * Legacy Round 1 2-step submission confirmation
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
   * Legacy Round 1 query submission status
   * @param {string} assignmentId
   * @param {string} groupId
   */
  async getSubmissionStatus(assignmentId, groupId) {
    const response = await api.get(`/submissions/${assignmentId}/${groupId}`);
    return response.data;
  },
};

export default submissionService;
