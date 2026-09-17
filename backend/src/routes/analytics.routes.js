const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const {
  authenticateJWT,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Strict Access Control: All analytics endpoints require authenticated ADMIN role
router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN'));

/**
 * System-wide analytics overview
 * GET /api/analytics/overview
 */
router.get('/overview', analyticsController.getOverview);

/**
 * Assignment completion analytics
 * GET /api/analytics/assignments
 */
router.get('/assignments', analyticsController.getAssignments);

/**
 * Group performance analytics
 * GET /api/analytics/groups
 */
router.get('/groups', analyticsController.getGroups);

/**
 * Recent submissions feed
 * GET /api/analytics/recent-submissions
 */
router.get('/recent-submissions', analyticsController.getRecentSubmissions);

module.exports = router;
