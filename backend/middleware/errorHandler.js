const { errorResponse } = require('../utils/responseHandler');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle mongoose connection errors specifically
  if (err.name === 'MongooseServerSelectionError') {
    return errorResponse(res, 'Database connection error', 503);
  }

  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return errorResponse(res, message, 400);
  }

  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return errorResponse(res, `Duplicate field value: ${value}`, 400);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  return errorResponse(res, 
    process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message, 
    statusCode
  );
};

module.exports = {
  AppError,
  errorHandler
};
