const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHandler');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, { errors: errors.array() }, 400);
  }
  next();
};

module.exports = validateRequest;
