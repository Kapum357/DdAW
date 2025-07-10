const { validationResult } = require('express-validator');
const createError = require('http-errors');

class BaseController {
  constructor(service) {
    this.service = service;
  }

  validateRequest(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, { errors: errors.array() });
    }
  }

  getAll(req, res, next) {
    this.service.getAll(req.query)
      .then(items => res.json(items))
      .catch(err => next(err));
  }

  getById(req, res, next) {
    this.service.getById(req.params.id)
      .then(item => {
        if (!item) {
          throw createError(404);
        }
        res.json(item);
      })
      .catch(err => next(err));
  }

  create(req, res, next) {
    this.validateRequest(req);
    this.service.create(req.body)
      .then(item => res.status(201).json(item))
      .catch(err => next(err));
  }

  update(req, res, next) {
    this.validateRequest(req);
    this.service.update(req.params.id, req.body)
      .then(item => {
        if (!item) {
          throw createError(404);
        }
        res.json(item);
      })
      .catch(err => next(err));
  }

  delete(req, res, next) {
    this.service.delete(req.params.id)
      .then(result => {
        if (!result) {
          throw createError(404);
        }
        res.status(204).send();
      })
      .catch(err => next(err));
  }
}

module.exports = BaseController;
