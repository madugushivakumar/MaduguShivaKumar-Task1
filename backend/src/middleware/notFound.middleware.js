const { HTTP_STATUS } = require('../constants/httpStatusCodes');
const { ApiError } = require('../utils/apiError');

const notFoundMiddleware = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route not found: ${req.method} ${req.originalUrl}`
  );
  next(error);
};

module.exports = { notFoundMiddleware };
