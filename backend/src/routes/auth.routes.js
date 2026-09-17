const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Public student account registration
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate credentials & receive JWT
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve currently authenticated user profile
 * @access  Private (STUDENT, ADMIN)
 */
router.get('/me', authenticateJWT, authController.getMe);

/**
 * @route   GET /api/auth/test-student
 * @desc    Verify STUDENT role authorization
 * @access  Private (STUDENT only)
 */
router.get(
  '/test-student',
  authenticateJWT,
  authorizeRoles('STUDENT'),
  authController.testStudent
);

/**
 * @route   GET /api/auth/test-admin
 * @desc    Verify ADMIN role authorization
 * @access  Private (ADMIN only)
 */
router.get(
  '/test-admin',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  authController.testAdmin
);

module.exports = router;
