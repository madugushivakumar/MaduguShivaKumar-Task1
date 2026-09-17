const { HTTP_STATUS } = require('../constants/httpStatusCodes');
const { env } = require('../config/env.config');

// eslint-disable-next-line no-unused-vars
const errorHandlerMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Handle PostgreSQL specific database errors gracefully
  if (err.code === '23505') {
    // Unique violation
    statusCode = HTTP_STATUS.CONFLICT;
    if (err.constraint === 'uq_group_student' || (err.detail && err.detail.includes('group_id'))) {
      message = 'Student is already a member of this group.';
    } else {
      message = 'A duplicate record with this information already exists.';
    }
  } else if (err.code === '23503') {
    // Foreign key violation
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Referenced entity does not exist.';
  } else if (err.code === '22P02') {
    // Invalid input syntax (e.g. invalid UUID)
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid identifier format provided.';
  }

  if (!statusCode) {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  // Prevent internal error details from leaking in production
  const isProduction = !env.isDevelopment;
  let safeMessage = message;
  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR && isProduction) {
    safeMessage = 'An unexpected internal server error occurred.';
  }

  const response = {
    success: false,
    message: safeMessage || 'Internal Server Error',
    ...(env.isDevelopment && { stack: err.stack }),
  };

  if (statusCode >= 500) {
    console.error(`[Error Handler] ${err.message}`, err.stack);
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandlerMiddleware };
