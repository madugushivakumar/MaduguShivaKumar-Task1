const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Get API health status
 * @access  Public
 */
router.get('/', healthController.getHealth);

/**
 * @route   GET /api/health/details
 * @desc    Get detailed API and database status
 * @access  Public
 */
router.get('/details', healthController.getDetailedHealth);

module.exports = router;
