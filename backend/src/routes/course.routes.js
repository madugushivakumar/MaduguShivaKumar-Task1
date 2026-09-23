const express = require('express');
const courseController = require('../controllers/course.controller');
const { validateUuidParams } = require('../validators/common.validator');
const {
  authenticateJWT,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

// All course endpoints require authentication
router.use(authenticateJWT);

/**
 * @route   GET /api/courses
 * @desc    Get courses relevant to current user (enrolled courses for student, taught courses for professor)
 * @access  Private (STUDENT, PROFESSOR, ADMIN)
 */
router.get('/', courseController.getCourses);

/**
 * @route   GET /api/courses/all
 * @desc    List all university courses (catalog view)
 * @access  Private (STUDENT, PROFESSOR, ADMIN)
 */
router.get('/all', courseController.getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get single course details, instructor, syllabus & assignments
 * @access  Private
 */
router.get('/:id', validateUuidParams('id'), courseController.getCourseById);

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (PROFESSOR, ADMIN)
 */
router.post(
  '/',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  courseController.createCourse
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course metadata
 * @access  Private (Course Instructor, ADMIN)
 */
router.put(
  '/:id',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  courseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course
 * @access  Private (Course Instructor, ADMIN)
 */
router.delete(
  '/:id',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  courseController.deleteCourse
);

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll a student into a course
 * @access  Private (PROFESSOR, ADMIN)
 */
router.post(
  '/:id/enroll',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  courseController.enrollStudent
);

/**
 * @route   GET /api/courses/:id/students
 * @desc    List all enrolled students for a course
 * @access  Private (PROFESSOR, ADMIN)
 */
router.get(
  '/:id/students',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  courseController.getEnrolledStudents
);

/**
 * @route   GET /api/courses/:id/analytics
 * @desc    Get course-level completion analytics
 * @access  Private (PROFESSOR, ADMIN)
 */
const professorController = require('../controllers/professor.controller');
router.get(
  '/:id/analytics',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  professorController.getCourseAnalytics
);

module.exports = router;
