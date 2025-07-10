const BaseController = require('./BaseController');
const UserService = require('../services/UserService');
const createError = require('http-errors');
const { validationResult } = require('express-validator');

class UserController extends BaseController {
  constructor() {
    super(new UserService());
  }

  register = async (req, res, next) => {
    try {
      this.validateRequest(req);
      const result = await this.service.register(
        req.body,
        req.get('User-Agent'),
        req.ip
      );
      
      // Set refresh token in HTTP-only cookie
      this.setRefreshTokenCookie(res, result.refreshToken);
      
      // Don't send refresh token in response body
      const { refreshToken, ...responseData } = result;
      res.status(201).json(responseData);
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, { errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await this.service.login(
        email, 
        password,
        req.get('User-Agent'),
        req.ip
      );

      // Set refresh token in HTTP-only cookie
      this.setRefreshTokenCookie(res, result.refreshToken);
      
      // Don't send refresh token in response body
      const { refreshToken, ...responseData } = result;
      res.json(responseData);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this.service.logout(refreshToken);
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken', this.getCookieOptions());
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  };

  logoutAll = async (req, res, next) => {
    try {
      await this.service.logoutAll(req.user._id);
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken', this.getCookieOptions());
      res.json({ message: 'Logged out from all devices successfully' });
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw createError(401, 'Refresh token required');
      }

      const result = await this.service.refreshToken(refreshToken, req.ip);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getActiveSessions = async (req, res, next) => {
    try {
      const sessions = await this.service.getActiveSessions(req.user._id);
      res.json(sessions);
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      this.validateRequest(req);
      const result = await this.service.updateProfile(req.user._id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  setRefreshTokenCookie(res, token) {
    res.cookie('refreshToken', token, this.getCookieOptions());
  }

  getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/users/refresh-token'
    };
  }
}

module.exports = UserController;
