const rateLimit = require('express-rate-limit');
const { AppError } = require('./errorHandler');

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Auth routes specific limiter (for login/register)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 500, // limit each IP to 5 login attempts per hour
    message: 'Too many login attempts from this IP, please try again after an hour'
});

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY');
    
    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:;");
    
    // HSTS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                // Remove HTML tags
                req.body[key] = req.body[key].replace(/<[^>]*>/g, '');
                // Prevent MongoDB Operator Injection
                if (req.body[key].startsWith('$') || req.body[key].includes('.')) {
                    return next(new AppError('Invalid input detected', 400));
                }
            }
        }
    }
    next();
};

// Password strength validator
const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return 'Password must be at least 8 characters long';
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return 'Password must include uppercase, lowercase, numbers and special characters';
    }

    return null;
};

module.exports = {
    limiter,
    authLimiter,
    securityHeaders,
    sanitizeInput,
    validatePasswordStrength
};
