const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that specified route params conform to standard UUID v4 format
 * @param  {...string} paramNames - e.g. 'id', 'studentId', 'assignmentId', 'groupId'
 */
const validateUuidParams = (...paramNames) => {
  return (req, res, next) => {
    for (const name of paramNames) {
      const val = req.params[name];
      if (val !== undefined && (!val || !UUID_REGEX.test(val.trim()))) {
        return next(
          new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `Invalid UUID format for parameter '${name}': "${val}".`
          )
        );
      }
    }
    next();
  };
};

module.exports = {
  UUID_REGEX,
  validateUuidParams,
};
