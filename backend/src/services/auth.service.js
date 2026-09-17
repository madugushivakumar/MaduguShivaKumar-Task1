const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { env } = require('../config/env.config');
const { ApiError } = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants/httpStatusCodes');

const BCRYPT_SALT_ROUNDS = 10;

class AuthService {
  /**
   * Sanitizes a user object by removing password_hash
   * @param {object} user
   * @returns {object}
   */
  sanitizeUser(user) {
    if (!user) return null;
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Generate signed JWT token
   * @param {object} payload
   * @param {string} payload.id
   * @param {string} payload.email
   * @param {string} payload.role
   * @returns {string}
   */
  generateToken({ id, email, role }) {
    return jwt.sign(
      {
        id,
        email,
        role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN,
      }
    );
  }

  /**
   * Register a new student account
   * @param {object} param0
   * @param {string} param0.name
   * @param {string} param0.email
   * @param {string} param0.password
   * @param {string} param0.studentId
   * @returns {Promise<{user: object, token: string}>}
   */
  async registerStudent({ name, email, password, studentId }) {
    // 1. Check duplicate email
    const existingEmailUser = await userRepository.findByEmail(email);
    if (existingEmailUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'An account with this email address already exists.'
      );
    }

    // 2. Check duplicate student ID
    const existingStudentIdUser = await userRepository.findByStudentId(studentId);
    if (existingStudentIdUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'A student account with this student ID already exists.'
      );
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 4. Create user record with strictly enforced STUDENT role
    const createdUser = await userRepository.create({
      name,
      email,
      passwordHash,
      role: 'STUDENT',
      studentId,
    });

    const safeUser = this.sanitizeUser(createdUser);
    const token = this.generateToken(safeUser);

    return {
      user: safeUser,
      token,
    };
  }

  /**
   * Authenticate user credentials and return JWT
   * @param {object} param0
   * @param {string} param0.email
   * @param {string} param0.password
   * @returns {Promise<{user: object, token: string}>}
   */
  async login({ email, password }) {
    // 1. Fetch user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password.'
      );
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password.'
      );
    }

    const safeUser = this.sanitizeUser(user);
    const token = this.generateToken(safeUser);

    return {
      user: safeUser,
      token,
    };
  }

  /**
   * Get safe user profile by ID
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User profile not found.');
    }
    return this.sanitizeUser(user);
  }
}

module.exports = new AuthService();
