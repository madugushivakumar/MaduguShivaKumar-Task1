const express = require('express');
const submissionController = require('../controllers/submission.controller');
const { validateConfirmSubmission } = require('../validators/submission.validator');
const { validateUuidParams } = require('../validators/common.validator');
const {
  authenticateJWT,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

// All submission routes require authenticated STUDENT access
router.use(authenticateJWT);
router.use(authorizeRoles('STUDENT'));

/**
 * Confirm assignment submission protocol
 * POST /api/submissions/confirm
 */
router.post('/confirm', validateConfirmSubmission, submissionController.confirmSubmission);

/**
 * Get current submission status for an assignment & group
 * GET /api/submissions/:assignmentId/:groupId
 */
router.get(
  '/:assignmentId/:groupId',
  validateUuidParams('assignmentId', 'groupId'),
  submissionController.getSubmissionStatus
);

module.exports = router;
