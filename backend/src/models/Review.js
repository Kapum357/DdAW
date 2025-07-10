const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  images: [{
    url: String,
    caption: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Add method to check if review is editable (within 30 days)
reviewSchema.methods.isEditable = function() {
  const EDIT_WINDOW_DAYS = 30;
  const timeDiff = Date.now() - this.createdAt.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  return daysDiff <= EDIT_WINDOW_DAYS;
};

module.exports = mongoose.model('Review', reviewSchema);
