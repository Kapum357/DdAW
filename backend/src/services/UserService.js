const BaseService = require('./BaseService');
const UserRepository = require('../repositories/UserRepository');
const UserDTO = require('../dto/UserDTO');
const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const sessionService = require('./SessionService');

class UserService extends BaseService {
  constructor() {
    super(new UserRepository(), UserDTO);
  }

  async register(userData, userAgent, ipAddress) {
    const dto = new UserDTO(userData);
    dto.validate();

    // Check if email exists
    const existingEmail = await this.repository.findByEmail(userData.email);
    if (existingEmail) {
      throw createError(400, 'Email already in use');
    }

    // Check if username exists
    const existingUsername = await this.repository.findByUsername(userData.username);
    if (existingUsername) {
      throw createError(400, 'Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Create user
    const userEntity = await this.repository.createUser({
      ...UserDTO.toEntity(dto),
      password: hashedPassword
    });

    // Create session and generate tokens
    const sessionData = await sessionService.createSession(
      userEntity,
      userAgent,
      ipAddress
    );

    return {
      ...sessionData,
      user: UserDTO.fromEntity(userEntity)
    };
  }

  async login(email, password, userAgent, ipAddress) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw createError(401, 'Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError(401, 'Invalid credentials');
    }

    // Create session and generate tokens
    const sessionData = await sessionService.createSession(
      user,
      userAgent,
      ipAddress
    );

    return {
      ...sessionData,
      user: UserDTO.fromEntity(user)
    };
  }

  async logout(refreshToken) {
    await sessionService.invalidateSession(refreshToken);
  }

  async logoutAll(userId) {
    await sessionService.invalidateAllUserSessions(userId);
  }

  async refreshToken(refreshToken, ipAddress) {
    return sessionService.refreshSession(refreshToken, ipAddress);
  }

  async getActiveSessions(userId) {
    return sessionService.getActiveSessions(userId);
  }

  async updateProfile(userId, updateData) {
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    const updated = await this.repository.update(userId, updateData);
    if (!updated) {
      throw createError(404, 'User not found');
    }

    return UserDTO.fromEntity(updated);
  }
}

module.exports = UserService;
