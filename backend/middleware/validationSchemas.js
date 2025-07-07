const { body } = require('express-validator');

const userValidation = {
  register: [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['client', 'pos_operator'])
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  update: [
    body('username').optional().trim().isLength({ min: 3 }).escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 })
  ]
};

const productValidation = {
  create: [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('price').isNumeric(),
    body('category').trim().notEmpty(),
    body('stock').optional().isNumeric(),
    body('status').optional().isIn(['available', 'out_of_stock', 'discontinued'])
  ],
  update: [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('price').optional().isNumeric(),
    body('category').optional().trim().notEmpty(),
    body('stock').optional().isNumeric(),
    body('status').optional().isIn(['available', 'out_of_stock', 'discontinued'])
  ]
};

const orderValidation = {
  create: [
    body('items').isArray(),
    body('items.*.product').isMongoId(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.price').isNumeric(),
    body('total').isNumeric(),
    body('servicePoint').trim().notEmpty()
  ],
  update: [
    body('status').isIn(['pending', 'processing', 'completed', 'cancelled'])
  ]
};

const inventoryValidation = {
  update: [
    body('quantity').optional().isNumeric(),
    body('minimumStock').optional().isNumeric(),
    body('reorderPoint').optional().isNumeric()
  ],
  addStock: [
    body('quantity').isNumeric().isInt({ min: 1 })
  ],
  removeStock: [
    body('quantity').isNumeric().isInt({ min: 1 })
  ]
};

module.exports = {
  userValidation,
  productValidation,
  orderValidation,
  inventoryValidation
};
