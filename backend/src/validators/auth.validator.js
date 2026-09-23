const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates student registration input
 */
const validateRegister = (req, res, next) => {
  const { name, email, password, studentId, role } = req.body;

  // 1. Role Tampering Prevention: ADMIN cannot be self-registered
  const targetRole = (role || 'STUDENT').toUpperCase();
  if (targetRole === 'ADMIN') {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Administrative accounts cannot be self-registered. Only STUDENT registration is permitted.'
    );
  }

  if (targetRole !== 'STUDENT' && targetRole !== 'PROFESSOR') {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Invalid registration role. Permitted roles are STUDENT or PROFESSOR.'
    );
  }

  // 2. Name validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Name is required and must be at least 2 characters long.'
    );
  }

  // 3. Email validation
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'A valid institutional email address is required.'
    );
  }

  // 4. Student ID validation (required for STUDENT, optional for PROFESSOR)
  if (targetRole === 'STUDENT') {
    if (!studentId || typeof studentId !== 'string' || studentId.trim().length < 3) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'A valid student ID is required (minimum 3 characters).'
      );
    }
  }

  // 5. Password validation
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Password must be at least 8 characters long.'
    );
  }

  // Sanitize and normalize fields
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.studentId = studentId && studentId.trim() ? studentId.trim().toUpperCase() : null;
  req.body.role = targetRole;

  next();
};

/**
 * Validates login input
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'A valid email address is required to log in.'
    );
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Password is required to log in.'
    );
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
