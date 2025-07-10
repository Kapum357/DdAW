const express = require('express');
const { body } = require('express-validator');
const BaseRouteFactory = require('./BaseRouteFactory');
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

// Create controller instance
const userController = new UserController();

// Validation schemas
const validations = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .escape()
      .matches(/^[a-zA-Z0-9_-]+$/),
    body('email')
      .isEmail()
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }),
    body('role')
      .optional()
      .isIn(['client', 'pos_operator'])
  ],
  login: [
    body('email')
      .isEmail()
      .normalizeEmail(),
    body('password')
      .exists()
  ],
  updateProfile: [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3 })
      .escape()
      .matches(/^[a-zA-Z0-9_-]+$/),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 8 })
  ]
};

// Create router
const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validations.register, userController.register);
router.post('/login', authLimiter, validations.login, userController.login);
router.post('/refresh-token', authLimiter, userController.refreshToken);

// Protected routes
router.use(authenticate);
router.post('/logout', userController.logout);
router.post('/logout-all', userController.logoutAll);
router.get('/sessions', userController.getActiveSessions);
router.put('/profile', validations.updateProfile, userController.updateProfile);

// Create base routes (protected)
const baseRouter = new BaseRouteFactory(
  userController,
  validations,
  { requireAuth: true }
).createRouter();

// Merge base routes
router.use('/', baseRouter);

module.exports = router;
