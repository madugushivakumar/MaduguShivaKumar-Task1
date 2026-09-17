const express = require('express');
const assignmentController = require('../controllers/assignment.controller');
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
 * Admin assignment management routes
 */
router.post(
  '/',
  authorizeRoles('ADMIN'),
  validateCreateAssignment,
  assignmentController.createAssignment
);

router.get(
  '/',
  authorizeRoles('ADMIN'),
  assignmentController.getAssignments
);

/**
 * Retrieve specific assignment details
 * Accessible by ADMIN or STUDENT (if coursework is allocated to student's group)
 */
router.get(
  '/:id',
  validateUuidParams('id'),
  assignmentController.getAssignmentById
);

/**
 * Update an assignment (Admin only)
 */
router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validateUuidParams('id'),
  validateUpdateAssignment,
  assignmentController.updateAssignment
);

/**
 * Allocate assignment to specific groups (Admin only)
 */
router.post(
  '/:id/groups',
  authorizeRoles('ADMIN'),
  validateUuidParams('id'),
  validateAssignGroups,
  assignmentController.assignToGroups
);

/**
 * Allocate assignment to all eligible groups in the system (Admin only)
 */
router.post(
  '/:id/assign-all',
  authorizeRoles('ADMIN'),
  validateUuidParams('id'),
  assignmentController.assignToAllGroups
);

/**
 * Delete an assignment (Admin only)
 */
router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  validateUuidParams('id'),
  assignmentController.deleteAssignment
);

module.exports = router;
