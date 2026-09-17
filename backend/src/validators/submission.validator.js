const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates submission confirmation payload
 */
const validateConfirmSubmission = (req, res, next) => {
  const { assignment_id, assignmentId, group_id, groupId } = req.body;

  const resolvedAssignmentId = assignment_id || assignmentId;
  const resolvedGroupId = group_id || groupId;

  if (!resolvedAssignmentId || typeof resolvedAssignmentId !== 'string') {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Assignment ID is required.'
    );
  }

  if (!UUID_REGEX.test(resolvedAssignmentId.trim())) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid assignment UUID format: "${resolvedAssignmentId}".`
    );
  }

  if (!resolvedGroupId || typeof resolvedGroupId !== 'string') {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Group ID is required.'
    );
  }

  if (!UUID_REGEX.test(resolvedGroupId.trim())) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid group UUID format: "${resolvedGroupId}".`
    );
  }

  req.body.assignmentId = resolvedAssignmentId.trim();
  req.body.groupId = resolvedGroupId.trim();

  next();
};

module.exports = {
  validateConfirmSubmission,
};
