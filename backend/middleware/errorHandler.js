const { errorResponse } = require('../utils/responseHandler');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 400);
  }

  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid ID format', 400);
  }

  if (err.code === 11000) {
    return errorResponse(res, 'Duplicate key error', 400);
  }

  return errorResponse(res, 'Internal server error', 500);
};

module.exports = {
  AppError,
  errorHandler
};
