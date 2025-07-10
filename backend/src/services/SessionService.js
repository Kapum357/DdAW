const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Session = require('../models/Session');
const createError = require('http-errors');

class SessionService {
  constructor() {
    this.accessTokenExpiry = '15m';  // Access tokens expire in 15 minutes
    this.refreshTokenExpiry = '7d';  // Refresh tokens expire in 7 days
    this.maxSessionsPerUser = 5;     // Maximum number of active sessions per user
  }

  async createSession(user, userAgent, ipAddress) {
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Create new session
    const session = new Session({
      userId: user._id,
      refreshToken,
      accessToken,
      userAgent,
      ipAddress,
      expiresAt
    });

    // Check and handle maximum sessions per user
    await this.enforceSessionLimit(user._id);

    // Save session
    await session.save();

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiry
    };
  }

  async refreshSession(refreshToken, ipAddress) {
    // Find and validate session
    const session = await Session.findOne({ refreshToken, isValid: true });
    if (!session || session.isExpired()) {
      throw createError(401, 'Invalid or expired refresh token');
    }

    // Update last activity
    session.lastActivityAt = new Date();
    
    // Generate new access token
    const user = { _id: session.userId };
    const accessToken = this.generateAccessToken(user);
    
    // Update session
    session.accessToken = accessToken;
    await session.save();

    return {
      accessToken,
      expiresIn: this.accessTokenExpiry
    };
  }

  async invalidateSession(refreshToken) {
    const session = await Session.findOne({ refreshToken });
    if (session) {
      await session.invalidate();
    }
  }

  async invalidateAllUserSessions(userId) {
    await Session.updateMany(
      { userId, isValid: true },
      { $set: { isValid: false } }
    );
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        type: 'access'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: this.accessTokenExpiry,
        issuer: process.env.JWT_ISSUER || 'your-app-name',
        audience: process.env.JWT_AUDIENCE || 'your-app-users'
      }
    );
  }

  generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  }

  async enforceSessionLimit(userId) {
    const sessions = await Session.find({ 
      userId, 
      isValid: true 
    }).sort({ lastActivityAt: -1 });

    if (sessions.length >= this.maxSessionsPerUser) {
      // Invalidate oldest sessions that exceed the limit
      const sessionsToInvalidate = sessions.slice(this.maxSessionsPerUser - 1);
      await Promise.all(
        sessionsToInvalidate.map(session => session.invalidate())
      );
    }
  }

  async validateAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== 'access') {
        throw createError(401, 'Invalid token type');
      }
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw createError(401, 'Token expired');
      }
      throw createError(401, 'Invalid token');
    }
  }

  async getActiveSessions(userId) {
    return Session.find({
      userId,
      isValid: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastActivityAt: -1 });
  }
}

module.exports = new SessionService();
