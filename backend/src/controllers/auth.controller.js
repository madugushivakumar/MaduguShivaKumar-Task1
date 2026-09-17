const authService = require('../services/auth.service');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

class AuthController {
  /**
   * POST /api/auth/register
   * Register a new student account
   */
  async register(req, res, next) {
    try {
      const result = await authService.registerStudent(req.body);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Student registration successful.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate credentials and receive JWT
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Login successful.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Retrieve the current authenticated user's safe profile
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User profile retrieved successfully.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/test-student
   * Test route for verifying STUDENT role authorization
   */
  async testStudent(req, res) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Student authorization verified successfully.',
      data: { user: req.user },
    });
  }

  /**
   * GET /api/auth/test-admin
   * Test route for verifying ADMIN role authorization
   */
  async testAdmin(req, res) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Admin authorization verified successfully.',
      data: { user: req.user },
    });
  }
}

module.exports = new AuthController();
