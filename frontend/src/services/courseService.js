import api from './api';

export const courseService = {
  /**
   * Get courses relevant to current user (enrolled courses for student, taught for professor)
   */
  async getCourses() {
    const response = await api.get('/courses');
    return response.data;
  },

  /**
   * Get all active courses in catalogue (for browsing/enrolling)
   */
  async getAllCourses() {
    const response = await api.get('/courses/all');
    return response.data;
  },

  /**
   * Get course details by ID including enrolled students and assignments
   * @param {string} id
   */
  async getCourseById(id) {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  /**
   * Create a new course (Professor / Admin)
   * @param {object} data
   */
  async createCourse(data) {
    const response = await api.post('/courses', data);
    return response.data;
  },

  /**
   * Update course details
   * @param {string} id
   * @param {object} data
   */
  async updateCourse(id, data) {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  /**
   * Delete course
   * @param {string} id
   */
  async deleteCourse(id) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  /**
   * Enroll a student in a course
   * @param {string} courseId
   * @param {string} [studentId] - Optional, defaults to current user
   */
  async enrollStudent(courseId, studentId = null) {
    const payload = studentId ? { student_id: studentId } : {};
    const response = await api.post(`/courses/${courseId}/enroll`, payload);
    return response.data;
  },

  /**
   * Get course-level analytics
   * @param {string} courseId
   */
  async getCourseAnalytics(courseId) {
    const response = await api.get(`/courses/${courseId}/analytics`);
    return response.data;
  },

  /**
   * Get professor dashboard metrics and recent activity
   */
  async getProfessorDashboard() {
    const response = await api.get('/professor/dashboard');
    return response.data;
  },
};

export default courseService;
