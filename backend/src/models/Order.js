const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    // Snapshot of product data at order time for historical accuracy
    productSnapshot: {
      name: String,
      description: String,
      category: String
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  servicePoint: {
    type: String,
    required: true,
    index: true
  },
  notifications: [{
    type: {
      type: String,
      enum: ['STATUS_CHANGE', 'COMMENT', 'SYSTEM'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  }],
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
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

// Compound indexes for common queries
orderSchema.index({ user: 1, status: 1, createdAt: -1 });
orderSchema.index({ servicePoint: 1, status: 1 });
orderSchema.index({ "items.product": 1, status: 1 });

// Pre-save middleware to update version
orderSchema.pre('save', function(next) {
  this.version += 1;
  next();
});

// Method to safely update order with optimistic concurrency
orderSchema.statics.updateWithOptimisticConcurrency = async function(id, updateData, version) {
  const result = await this.findOneAndUpdate(
    { 
      _id: id,
      version: version 
    },
    {
      ...updateData,
      $inc: { version: 1 }
    },
    { 
      new: true,
      runValidators: true
    }
  );

  if (!result) {
    throw new Error('Concurrent modification detected. Please refresh and try again.');
  }

  return result;
};

// Virtual for order age
orderSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

// Create necessary indexes
Order.syncIndexes();

module.exports = Order;
