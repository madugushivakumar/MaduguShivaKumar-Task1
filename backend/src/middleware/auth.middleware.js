const jwt = require('jsonwebtoken');
const { env } = require('../config/env.config');
const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

/**
 * Authentication Middleware: Validates JWT from Authorization: Bearer <token>
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Access denied: No authentication token provided.'
      )
    );
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Access denied: Invalid token format. Expected "Bearer <token>".'
      )
    );
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication failed: Token has expired. Please log in again.'
        )
      );
    }
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication failed: Invalid or malformed token.'
      )
    );
  }
};

/**
 * Role-Based Authorization Middleware: Enforces user role permissions
 * @param  {...string} allowedRoles - E.g. 'ADMIN', 'STUDENT'
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Unauthorized: User authentication required.'
        )
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
};
