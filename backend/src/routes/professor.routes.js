const express = require('express');
const professorController = require('../controllers/professor.controller');
const { validateUuidParams } = require('../validators/common.validator');
const {
  authenticateJWT,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles('PROFESSOR', 'ADMIN'));

/**
 * @route   GET /api/professor/dashboard
 * @desc    Dedicated professor dashboard summary metrics and courses
 * @access  Private (PROFESSOR, ADMIN)
 */
router.get('/dashboard', professorController.getDashboard);

/**
 * @route   GET /api/professor/courses/:id/analytics
 * @desc    Course-level submission & progress analytics
 * @access  Private (PROFESSOR, ADMIN)
 */
router.get(
  '/courses/:id/analytics',
  validateUuidParams('id'),
  professorController.getCourseAnalytics
);

/**
 * @route   GET /api/professor/assignments/:id/progress
 * @desc    Assignment-level progress tracking
 * @access  Private (PROFESSOR, ADMIN)
 */
router.get(
  '/assignments/:id/progress',
  validateUuidParams('id'),
  professorController.getAssignmentProgress
);

module.exports = router;
