const createError = require('http-errors');
const sessionService = require('../services/SessionService');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = await sessionService.validateAccessToken(token);

    // Get user data
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw createError(401, 'User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(createError(401, error.message));
  }
};

exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'Insufficient permissions'));
    }

    next();
  };
};
