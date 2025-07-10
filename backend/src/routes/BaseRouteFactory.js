const express = require('express');
const { authenticate } = require('../middleware/auth');

class BaseRouteFactory {
  constructor(controller, validations = {}, options = {}) {
    this.controller = controller;
    this.validations = validations;
    this.options = {
      requireAuth: true,
      ...options
    };
  }

  createRouter() {
    const router = express.Router();

    // Apply authentication middleware if required
    if (this.options.requireAuth) {
      router.use(authenticate);
    }

    // GET /
    router.get('/', 
      this.validations.getAll || [],
      this.controller.getAll.bind(this.controller)
    );

    // GET /:id
    router.get('/:id',
      this.validations.getById || [],
      this.controller.getById.bind(this.controller)
    );

    // POST /
    router.post('/',
      this.validations.create || [],
      this.controller.create.bind(this.controller)
    );

    // PUT /:id
    router.put('/:id',
      this.validations.update || [],
      this.controller.update.bind(this.controller)
    );

    // DELETE /:id
    router.delete('/:id',
      this.validations.delete || [],
      this.controller.delete.bind(this.controller)
    );

    return router;
  }
}

module.exports = BaseRouteFactory;
