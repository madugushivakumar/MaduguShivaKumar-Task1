const express = require('express');
const assignmentController = require('../controllers/assignment.controller');
const submissionController = require('../controllers/submission.controller');
const {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateAssignGroups,
} = require('../validators/assignment.validator');
const { validateUuidParams } = require('../validators/common.validator');
const {
  authenticateJWT,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

// All assignment endpoints require authentication
router.use(authenticateJWT);

/**
 * Student-specific coursework feed
 * Note: Must be declared before /:id parameter route
 */
router.get(
  '/student',
  authorizeRoles('STUDENT'),
  assignmentController.getStudentAssignments
);

router.get(
  '/student/:id',
  authorizeRoles('STUDENT'),
  validateUuidParams('id'),
  assignmentController.getStudentAssignmentById
);

/**
 * Submit an assignment (Individual or Group)
 * POST /api/assignments/:id/submit
 */
router.post(
  '/:id/submit',
  authorizeRoles('STUDENT'),
  validateUuidParams('id'),
  submissionController.submitAssignment
);

/**
 * Acknowledge an assignment submission
 * Note: For group assignments, ONLY the group leader can acknowledge (enforced in service).
 * POST /api/assignments/:id/acknowledge
 */
router.post(
  '/:id/acknowledge',
  authorizeRoles('STUDENT'),
  validateUuidParams('id'),
  submissionController.acknowledgeAssignment
);

/**
 * Get submission & acknowledgment status for an assignment
 * GET /api/assignments/:id/status
 */
router.get(
  '/:id/status',
  validateUuidParams('id'),
  submissionController.getStatus
);

/**
 * List all submissions for an assignment (Faculty only)
 * GET /api/assignments/:id/submissions
 */
router.get(
  '/:id/submissions',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  submissionController.getSubmissionsForAssignment
);

/**
 * Get assignment submission progress (Faculty only)
 * GET /api/assignments/:id/progress
 */
const professorController = require('../controllers/professor.controller');
router.get(
  '/:id/progress',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  professorController.getAssignmentProgress
);

/**
 * Faculty assignment management routes (Create, List, Update, Delete, Allocations)
 */
router.post(
  '/',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateCreateAssignment,
  assignmentController.createAssignment
);

router.get(
  '/',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  assignmentController.getAssignments
);

/**
 * Retrieve specific assignment details
 * Accessible by faculty or student
 */
router.get(
  '/:id',
  validateUuidParams('id'),
  assignmentController.getAssignmentById
);

/**
 * Update an assignment (Faculty only)
 */
router.put(
  '/:id',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  validateUpdateAssignment,
  assignmentController.updateAssignment
);

/**
 * Allocate assignment to specific groups (Faculty only)
 */
router.post(
  '/:id/groups',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  validateAssignGroups,
  assignmentController.assignToGroups
);

/**
 * Allocate assignment to all eligible groups in the system (Faculty only)
 */
router.post(
  '/:id/assign-all',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  assignmentController.assignToAllGroups
);

/**
 * Delete an assignment (Faculty only)
 */
router.delete(
  '/:id',
  authorizeRoles('PROFESSOR', 'ADMIN'),
  validateUuidParams('id'),
  assignmentController.deleteAssignment
);

module.exports = router;
