const express = require('express');
const groupController = require('../controllers/group.controller');
const progressController = require('../controllers/progress.controller');
const {
  validateCreateGroup,
  validateAddMember,
} = require('../validators/group.validator');
const { validateUuidParams } = require('../validators/common.validator');
const {
  authenticateJWT,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/groups
 * @desc    Create a new student group
 * @access  Private (STUDENT only)
 */
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('STUDENT'),
  validateCreateGroup,
  groupController.create
);

/**
 * @route   GET /api/groups
 * @desc    List groups relevant to authenticated user
 * @access  Private (STUDENT, ADMIN)
 */
router.get('/', authenticateJWT, groupController.list);

/**
 * @route   GET /api/groups/:groupId/progress or /api/groups/:id/progress
 * @desc    Calculate group progress based on assignments assigned to that group
 * @access  Private (Group Members, ADMIN)
 */
router.get('/:groupId/progress', authenticateJWT, validateUuidParams('groupId'), progressController.getGroupProgress);
router.get('/:id/progress', authenticateJWT, validateUuidParams('id'), progressController.getGroupProgress);

/**
 * @route   GET /api/groups/:groupId/members or /api/groups/:id/members
 * @desc    List all members of a group
 * @access  Private (Group Members, ADMIN)
 */
router.get('/:groupId/members', authenticateJWT, validateUuidParams('groupId'), groupController.listMembers);
router.get('/:id/members', authenticateJWT, validateUuidParams('id'), groupController.listMembers);

/**
 * @route   GET /api/groups/:id
 * @desc    Get details and member list for a specific group
 * @access  Private (Group Members, ADMIN)
 */
router.get('/:id', authenticateJWT, validateUuidParams('id'), groupController.getById);

/**
 * @route   POST /api/groups/:groupId/members or /api/groups/:id/members
 * @desc    Add a student to the group by email or student ID
 * @access  Private (Group Members, ADMIN)
 */
router.post(
  '/:groupId/members',
  authenticateJWT,
  authorizeRoles('STUDENT', 'ADMIN'),
  validateUuidParams('groupId'),
  validateAddMember,
  groupController.addMember
);
router.post(
  '/:id/members',
  authenticateJWT,
  authorizeRoles('STUDENT', 'ADMIN'),
  validateUuidParams('id'),
  validateAddMember,
  groupController.addMember
);

/**
 * @route   DELETE /api/groups/:groupId/members/:studentId or /api/groups/:id/members/:studentId
 * @desc    Remove a member from the group (creator only, or member self-removal)
 * @access  Private (Group Creator, Self-removal, ADMIN)
 */
router.delete(
  '/:groupId/members/:studentId',
  authenticateJWT,
  authorizeRoles('STUDENT', 'ADMIN'),
  validateUuidParams('groupId', 'studentId'),
  groupController.removeMember
);
router.delete(
  '/:id/members/:studentId',
  authenticateJWT,
  authorizeRoles('STUDENT', 'ADMIN'),
  validateUuidParams('id', 'studentId'),
  groupController.removeMember
);

module.exports = router;
