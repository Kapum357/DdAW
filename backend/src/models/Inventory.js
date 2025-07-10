const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  servicePoint: {
    type: String,
    required: true,
    index: true
  },
  minimumStock: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    default: 20,
    min: 0
  },
  version: {
    type: Number,
    default: 0
  },
  lastModifiedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  stockHistory: [{
    quantity: Number,
    type: {
      type: String,
      enum: ['ADD', 'REMOVE', 'ADJUST', 'RESERVE', 'UNRESERVE'],
      required: true
    },
    reason: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  }]
}, {
  timestamps: true,
  optimisticConcurrency: true
});

// Compound indexes for common queries
inventorySchema.index({ servicePoint: 1, quantity: 1 });
inventorySchema.index({ product: 1, servicePoint: 1 }, { unique: true });

// Virtual for available quantity
inventorySchema.virtual('availableQuantity').get(function() {
  return this.quantity - this.reservedQuantity;
});

// Pre-save middleware for version control
inventorySchema.pre('save', function(next) {
  this.version += 1;
  next();
});

// Method to safely update stock with optimistic concurrency
inventorySchema.statics.updateStockWithConcurrency = async function(
  id, 
  quantityChange, 
  type, 
  reason, 
  userId,
  version
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const inventory = await this.findOne({ _id: id, version: version }).session(session);
    if (!inventory) {
      throw new Error('Concurrent modification detected. Please refresh and try again.');
    }

    const newQuantity = inventory.quantity + quantityChange;
    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    inventory.quantity = newQuantity;
    inventory.version += 1;
    inventory.stockHistory.push({
      quantity: quantityChange,
      type,
      reason,
      performedBy: userId
    });

    await inventory.save({ session });
    await session.commitTransaction();
    return inventory;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Method to reserve stock for orders
inventorySchema.statics.reserveStock = async function(id, quantity, userId, version) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const inventory = await this.findOne({ _id: id, version: version }).session(session);
    if (!inventory) {
      throw new Error('Concurrent modification detected. Please refresh and try again.');
    }

    if (inventory.availableQuantity < quantity) {
      throw new Error('Insufficient stock available for reservation');
    }

    inventory.reservedQuantity += quantity;
    inventory.version += 1;
    inventory.stockHistory.push({
      quantity,
      type: 'RESERVE',
      reason: 'Order reservation',
      performedBy: userId
    });

    await inventory.save({ session });
    await session.commitTransaction();
    return inventory;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Ensure virtuals are included in JSON
inventorySchema.set('toJSON', { virtuals: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

// Create necessary indexes
Inventory.syncIndexes();

module.exports = Inventory;
