const { errorResponse } = require('../utils/responseHandler');

// AppError class for custom errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('ERROR DETAILS:', {
    message: err.message,
    stack: err.stack,
    path: req.path
  });

  // Return more detailed error in response for debugging
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? err.message || 'Something went wrong' 
        : err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    }
  });
};

module.exports = { AppError, errorHandler };