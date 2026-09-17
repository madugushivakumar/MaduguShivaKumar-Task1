const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const groupRepository = require('../repositories/group.repository');
const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

/**
 * Derives a clean human-readable name from an institutional email address
 * e.g., friend.name@university.edu -> "Friend Name"
 *       friend@university.edu -> "Friend"
 * @param {string} email
 * @returns {string}
 */
function deriveNameFromEmail(email) {
  if (!email || typeof email !== 'string') return 'Student';
  const localPart = email.split('@')[0];
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'Student';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

class GroupService {
  /**
   * Create a new student group with authenticated student as creator
   * @param {object} param0
   * @param {string} param0.name
   * @param {string} param0.studentId
   * @returns {Promise<object>}
   */
  async createGroup({ name, studentId }) {
    const newGroup = await groupRepository.createWithCreatorAsMember({
      name,
      createdBy: studentId,
    });

    return {
      ...newGroup,
      member_count: 1,
      is_creator: true,
    };
  }

  /**
   * Get groups relevant to authenticated user
   * @param {object} user
   * @returns {Promise<Array>}
   */
  async getGroupsForUser(user) {
    if (user.role === 'ADMIN') {
      return await groupRepository.listAll();
    }
    return await groupRepository.listGroupsForStudent(user.id);
  }

  /**
   * Get group details with authorization enforcement
   * @param {string} groupId
   * @param {object} user
   * @returns {Promise<object>}
   */
  async getGroupDetails(groupId, user) {
    const group = await groupRepository.findByIdWithDetails(groupId);
    if (!group) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    // Students can only access groups they are a member of
    if (user.role === 'STUDENT') {
      const isMember = await groupRepository.isMember(groupId, user.id);
      if (!isMember) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'Access denied: You are not an authorized member of this group.'
        );
      }
    }

    const members = await groupRepository.listMembers(groupId);

    return {
      ...group,
      members,
      is_creator: group.created_by === user.id,
    };
  }

  /**
   * Add a student member to a group by email and/or student ID.
   * Supports both existing students (reuses record) and unregistered students/friends
   * (creates minimal secure STUDENT record in PostgreSQL atomically).
   * @param {string} groupId
   * @param {object} param1
   * @param {string} [param1.email]
   * @param {string} [param1.studentId]
   * @param {string} [param1.student_id]
   * @param {string} [param1.name]
   * @param {object} requestingUser
   * @returns {Promise<object>}
   */
  async addMember(groupId, { email, studentId, student_id, name }, requestingUser) {
    // 1. Verify group exists
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    // 2. Authorization: Only members or creator can invite (or ADMIN)
    const isMember = await groupRepository.isMember(groupId, requestingUser.id);
    if (!isMember && requestingUser.role !== 'ADMIN') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Access denied: Only active group members can add new members.'
      );
    }

    // 3. Normalize input values
    const inputEmail = email ? email.trim().toLowerCase() : null;
    const resolvedId = studentId !== undefined ? studentId : student_id;
    const inputStudentId = resolvedId ? resolvedId.trim().toUpperCase() : null;
    const inputName = name && typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;

    if (!inputEmail && !inputStudentId) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Either student email or student ID is required to add a member.'
      );
    }

    // 4. Query existing users by email and student ID independently
    const userByEmail = inputEmail ? await groupRepository.findUserByEmail(inputEmail) : null;
    const userByStudentId = inputStudentId ? await groupRepository.findUserByStudentId(inputStudentId) : null;

    let targetUser = null;
    let isNewStudent = false;

    // 5. Evaluate matching and conflict rules
    if (inputEmail && inputStudentId) {
      if (userByEmail && userByStudentId) {
        // Both exist: verify they belong to the SAME student
        if (userByEmail.id !== userByStudentId.id) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            'The email address and student ID belong to different students.'
          );
        }
        targetUser = userByEmail;
      } else if (userByEmail && !userByStudentId) {
        // Email belongs to a student, but student ID does not match
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          'The email address and student ID do not match the existing student record.'
        );
      } else if (!userByEmail && userByStudentId) {
        // Student ID belongs to a student, but email does not match
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          'The student ID and email address do not match the existing student record.'
        );
      } else {
        // Neither exists: create new student record
        isNewStudent = true;
      }
    } else if (inputEmail && !inputStudentId) {
      if (userByEmail) {
        targetUser = userByEmail;
      } else {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          'Student not found. Please verify the institutional email or student ID.'
        );
      }
    } else if (!inputEmail && inputStudentId) {
      if (userByStudentId) {
        targetUser = userByStudentId;
      } else {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          'Student not found. Please verify the institutional email or student ID.'
        );
      }
    }

    // 6. Role check: Admins and non-students cannot be added as student group members
    if (targetUser && targetUser.role !== 'STUDENT') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Administrators and Faculty cannot be added as student group members.'
      );
    }

    // 7. Prevent duplicate membership for existing user
    if (targetUser) {
      const isAlreadyMember = await groupRepository.isMember(groupId, targetUser.id);
      if (isAlreadyMember) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          'Student is already a member of this group.'
        );
      }
    }

    // 8. Atomic Database Transaction: Create student (if new) & Insert Group Membership
    let newMemberRecord = null;

    if (isNewStudent) {
      const finalName = inputName || deriveNameFromEmail(inputEmail);
      // Generate unusable random password hash (secure, satisfies NOT NULL constraint)
      const randomSecret = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomSecret, 10);

      try {
        const result = await groupRepository.addMemberWithResolution({
          groupId,
          newStudent: {
            name: finalName,
            email: inputEmail,
            studentId: inputStudentId,
            passwordHash,
          },
        });
        targetUser = result.user;
        newMemberRecord = result.member;
      } catch (err) {
        if (err.code === '23505') {
          // Unique constraint violation (e.g. concurrent creation race condition)
          if (err.constraint === 'uq_group_student') {
            throw new ApiError(HTTP_STATUS.CONFLICT, 'Student is already a member of this group.');
          }
          throw new ApiError(HTTP_STATUS.CONFLICT, 'A student account with this email or student ID already exists.');
        }
        throw err;
      }
    } else {
      try {
        const result = await groupRepository.addMemberWithResolution({
          groupId,
          existingUserId: targetUser.id,
        });
        newMemberRecord = result.member;
      } catch (err) {
        if (err.code === '23505') {
          if (err.constraint === 'uq_group_student') {
            throw new ApiError(HTTP_STATUS.CONFLICT, 'Student is already a member of this group.');
          }
        }
        throw err;
      }
    }

    // 9. Fetch updated roster
    const updatedMembers = await groupRepository.listMembers(groupId);

    return {
      member: {
        id: targetUser.id,
        student_id: targetUser.student_id,
        name: targetUser.name,
        email: targetUser.email,
        joined_at: newMemberRecord.joined_at,
      },
      addedMember: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        studentId: targetUser.student_id,
        student_id: targetUser.student_id,
      },
      members: updatedMembers,
      memberCount: updatedMembers.length,
    };
  }

  /**
   * List group members with authorization check
   * @param {string} groupId
   * @param {object} user
   * @returns {Promise<Array>}
   */
  async listMembers(groupId, user) {
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    if (user.role === 'STUDENT') {
      const isMember = await groupRepository.isMember(groupId, user.id);
      if (!isMember) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'Access denied: You are not a member of this group.'
        );
      }
    }

    return await groupRepository.listMembers(groupId);
  }

  /**
   * Remove a member from a group
   * @param {string} groupId
   * @param {string} targetStudentId
   * @param {object} requestingUser
   * @returns {Promise<object>}
   */
  async removeMember(groupId, targetStudentId, requestingUser) {
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Group not found.');
    }

    // Design Decision: Group creator cannot be removed from their own group
    if (targetStudentId === group.created_by) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'The group creator cannot be removed from the group.'
      );
    }

    // Authorization: Only the creator can remove members, or a student can leave themselves
    const isCreator = group.created_by === requestingUser.id;
    const isSelfRemoval = requestingUser.id === targetStudentId;

    if (!isCreator && !isSelfRemoval && requestingUser.role !== 'ADMIN') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Access denied: Only the group creator can remove other members.'
      );
    }

    // Verify target student is an active member
    const isTargetMember = await groupRepository.isMember(groupId, targetStudentId);
    if (!isTargetMember) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        'Target student is not an active member of this group.'
      );
    }

    await groupRepository.removeMember({
      groupId,
      studentId: targetStudentId,
    });

    const updatedMembers = await groupRepository.listMembers(groupId);

    return {
      success: true,
      message: isSelfRemoval
        ? 'You have successfully left the group.'
        : 'Member was successfully removed from the group.',
      members: updatedMembers,
      memberCount: updatedMembers.length,
    };
  }
}

module.exports = new GroupService();
