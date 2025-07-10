const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Price cannot be negative'
    }
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  imageUrl: String,
  status: {
    type: String,
    enum: ['available', 'out_of_stock', 'discontinued'],
    default: 'available',
    index: true
  },
  version: {
    type: Number,
    default: 0
  },
  priceHistory: [{
    price: {
      type: Number,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  }],
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
  metadata: {
    featured: {
      type: Boolean,
      default: false
    },
    tags: [String],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

// Compound indexes for common queries
productSchema.index({ category: 1, status: 1 });
productSchema.index({ "metadata.featured": 1, status: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware for version control
productSchema.pre('save', function(next) {
  this.version += 1;

  // Track price changes
  if (this.isModified('price')) {
    this.priceHistory.push({
      price: this.price,
      changedBy: this.lastModifiedBy.userId
    });
  }

  next();
});

// Method to safely update product with optimistic concurrency
productSchema.statics.updateWithConcurrency = async function(id, updateData, userId, userRole, version) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await this.findOne({ _id: id, version: version }).session(session);
    if (!product) {
      throw new Error('Concurrent modification detected. Please refresh and try again.');
    }

    Object.assign(product, updateData);
    product.lastModifiedBy = {
      userId,
      role: userRole
    };

    await product.save({ session });
    await session.commitTransaction();
    return product;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Method to update product rating
productSchema.methods.updateRating = async function(newRating) {
  const currentCount = this.metadata.ratings.count;
  const currentAverage = this.metadata.ratings.average;
  
  this.metadata.ratings.count += 1;
  this.metadata.ratings.average = (
    (currentAverage * currentCount + newRating) / 
    (currentCount + 1)
  );

  return this.save();
};

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

// Create necessary indexes
Product.syncIndexes();

module.exports = Product;
