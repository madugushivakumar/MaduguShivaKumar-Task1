const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates group creation payload
 */
const validateCreateGroup = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Group name is required and must be at least 2 characters long.'
    );
  }

  if (name.trim().length > 100) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Group name cannot exceed 100 characters.'
    );
  }

  req.body.name = name.trim();
  next();
};

/**
 * Validates adding a member payload (accepts email, student ID, or both)
 */
const validateAddMember = (req, res, next) => {
  const { email, student_id, studentId, name } = req.body;
  const resolvedStudentId = studentId !== undefined ? studentId : student_id;

  const hasEmail = email !== undefined && typeof email === 'string' && email.trim().length > 0;
  const hasStudentId = resolvedStudentId !== undefined && typeof resolvedStudentId === 'string' && resolvedStudentId.trim().length > 0;

  if (!hasEmail && !hasStudentId) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Either student email or student ID is required to add a member.'
    );
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Please provide a valid institutional email address.'
      );
    }
    req.body.email = email.trim().toLowerCase();
  }

  if (resolvedStudentId !== undefined) {
    if (typeof resolvedStudentId !== 'string' || resolvedStudentId.trim().length < 2) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Please provide a valid student ID number.'
      );
    }
    req.body.studentId = resolvedStudentId.trim().toUpperCase();
    req.body.student_id = req.body.studentId;
  }

  if (name !== undefined) {
    if (typeof name === 'string') {
      req.body.name = name.trim();
    }
  }

  next();
};

module.exports = {
  validateCreateGroup,
  validateAddMember,
};
