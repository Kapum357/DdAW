const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  servicePoint: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  minimumStock: {
    type: Number,
    required: true,
    default: 10
  },
  reorderPoint: {
    type: Number,
    required: true,
    default: 20
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);
