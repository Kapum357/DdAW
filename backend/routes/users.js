const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');
const { authLimiter, validatePasswordStrength } = require('../middleware/security');

// Enhanced validation for registration
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .escape()
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores and hyphens'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .custom(async (email) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email already in use');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 8 })
        .custom((value) => {
            const validationError = validatePasswordStrength(value);
            if (validationError) {
                throw new Error(validationError);
            }
            return true;
        }),
    body('role')
        .optional()
        .isIn(['client', 'pos_operator'])
];

// Registration endpoint with enhanced security
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role = 'client' } = req.body;

        // Additional username check
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ 
                message: 'Username already taken' 
            });
        }

        // Hash password with increased rounds for better security
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        await user.save();

        // Generate JWT with user-specific claims
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role,
                // Add a unique session identifier
                sessionId: require('crypto').randomBytes(32).toString('hex')
            }, 
            process.env.JWT_SECRET,
            { 
                expiresIn: '24h',
                issuer: 'your-app-name',
                audience: 'your-app-users'
            }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login endpoint with rate limiting
router.post('/login', authLimiter, async (req, res) => {
    try {
        console.log('Login attempt for:', req.body.email);
        const { email, password } = req.body;

        // Find user and select password field explicitly
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        console.log('User found, verifying password');
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        console.log('Password verified, generating token');
        // Generate JWT
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role,
                sessionId: require('crypto').randomBytes(16).toString('hex')
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', email);
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: error.message || 'An error occurred during login'
        });
    }
});

// Protected route for profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Protected route for listing users (admin only)
router.get('/', auth, checkRole('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
