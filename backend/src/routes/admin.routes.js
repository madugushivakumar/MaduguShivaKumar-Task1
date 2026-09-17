const express = require('express');
const progressController = require('../controllers/progress.controller');
const { validateUuidParams } = require('../validators/common.validator');
const {
  authenticateJWT,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

// All admin monitoring endpoints require authenticated ADMIN role
router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN'));

/**
 * System-wide progress and statistics overview
 * GET /api/admin/dashboard/summary
 */
router.get('/dashboard/summary', progressController.getAdminDashboardSummary);

/**
 * List all groups with progress metrics and filters
 * GET /api/admin/groups
 */
router.get('/groups', progressController.getAdminGroups);

/**
 * Detailed group information, members roster, and assigned coursework status
 * GET /api/admin/groups/:id
 */
router.get('/groups/:id', validateUuidParams('id'), progressController.getAdminGroupDetails);

/**
 * System-wide submissions monitoring feed
 * GET /api/admin/submissions
 */
router.get('/submissions', progressController.getAllSubmissions);

/**
 * Student-wise submission confirmation tracking
 * Note: Declared before parameterized route /submissions/assignment/:assignmentId
 * GET /api/admin/submissions/student-wise
 */
router.get('/submissions/student-wise', progressController.getStudentWiseSubmissions);

/**
 * Assignment-wise submission progress and group roster
 * GET /api/admin/submissions/assignment/:assignmentId
 */
router.get(
  '/submissions/assignment/:assignmentId',
  validateUuidParams('assignmentId'),
  progressController.getAssignmentWiseSubmissions
);

/**
 * Group-wise submission progress and coursework roster
 * GET /api/admin/submissions/group/:groupId
 */
router.get(
  '/submissions/group/:groupId',
  validateUuidParams('groupId'),
  progressController.getGroupWiseSubmissions
);

module.exports = router;
