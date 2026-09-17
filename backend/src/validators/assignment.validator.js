const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Validates assignment creation payload
 */
const validateCreateAssignment = (req, res, next) => {
  const {
    title,
    description,
    due_date,
    dueDate,
    onedrive_link,
    onedriveLink,
    group_ids,
    groupIds,
    assign_all,
    assignAll,
  } = req.body;

  // Title validation
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Assignment title is required and must be at least 3 characters long.'
    );
  }
  if (title.trim().length > 255) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Assignment title cannot exceed 255 characters.'
    );
  }

  // Due date validation
  const resolvedDueDate = due_date || dueDate;
  if (!resolvedDueDate) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Assignment due date is required.'
    );
  }
  const parsedDate = new Date(resolvedDueDate);
  if (isNaN(parsedDate.getTime())) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Please provide a valid ISO format due date (e.g. 2026-10-15T23:59:00Z).'
    );
  }

  // OneDrive link validation
  const resolvedOnedriveLink = onedrive_link || onedriveLink;
  if (!resolvedOnedriveLink || typeof resolvedOnedriveLink !== 'string') {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'OneDrive submission link is required.'
    );
  }
  if (!isValidUrl(resolvedOnedriveLink.trim())) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Please provide a valid HTTP or HTTPS OneDrive submission URL.'
    );
  }

  // Optional group_ids validation
  const resolvedGroupIds = group_ids || groupIds;
  if (resolvedGroupIds !== undefined) {
    if (!Array.isArray(resolvedGroupIds)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'group_ids must be an array of group UUID strings.'
      );
    }
    for (const gid of resolvedGroupIds) {
      if (!UUID_REGEX.test(gid)) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Invalid group UUID format: "${gid}".`
        );
      }
    }
    req.body.groupIds = resolvedGroupIds;
  }

  // Standardize cleaned body
  req.body.title = title.trim();
  req.body.description = description ? String(description).trim() : '';
  req.body.dueDate = parsedDate.toISOString();
  req.body.onedriveLink = resolvedOnedriveLink.trim();
  req.body.assignAll = Boolean(assign_all || assignAll);

  next();
};

/**
 * Validates assignment update payload
 */
const validateUpdateAssignment = (req, res, next) => {
  const { title, description, due_date, dueDate, onedrive_link, onedriveLink } = req.body;

  const hasAnyField =
    title !== undefined ||
    description !== undefined ||
    due_date !== undefined ||
    dueDate !== undefined ||
    onedrive_link !== undefined ||
    onedriveLink !== undefined;

  if (!hasAnyField) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'At least one field (title, description, due_date, or onedrive_link) must be provided for update.'
    );
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Assignment title must be at least 3 characters long.'
      );
    }
    if (title.trim().length > 255) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Assignment title cannot exceed 255 characters.'
      );
    }
    req.body.title = title.trim();
  }

  if (description !== undefined) {
    req.body.description = String(description).trim();
  }

  const resolvedDueDate = due_date !== undefined ? due_date : dueDate;
  if (resolvedDueDate !== undefined) {
    const parsedDate = new Date(resolvedDueDate);
    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Please provide a valid ISO format due date.'
      );
    }
    req.body.dueDate = parsedDate.toISOString();
  }

  const resolvedOnedriveLink = onedrive_link !== undefined ? onedrive_link : onedriveLink;
  if (resolvedOnedriveLink !== undefined) {
    if (typeof resolvedOnedriveLink !== 'string' || !isValidUrl(resolvedOnedriveLink.trim())) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Please provide a valid HTTP or HTTPS OneDrive submission URL.'
      );
    }
    req.body.onedriveLink = resolvedOnedriveLink.trim();
  }

  next();
};

/**
 * Validates assign to groups payload
 */
const validateAssignGroups = (req, res, next) => {
  const { group_ids, groupIds } = req.body;
  const resolvedGroupIds = group_ids || groupIds;

  if (!resolvedGroupIds || !Array.isArray(resolvedGroupIds) || resolvedGroupIds.length === 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Please provide a non-empty array of group IDs in "group_ids".'
    );
  }

  for (const gid of resolvedGroupIds) {
    if (!gid || !UUID_REGEX.test(gid)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Invalid group UUID format: "${gid}".`
      );
    }
  }

  req.body.groupIds = resolvedGroupIds;
  next();
};

module.exports = {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateAssignGroups,
};
