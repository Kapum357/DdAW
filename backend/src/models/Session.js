const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  accessToken: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
sessionSchema.index({ userId: 1, isValid: 1 });
sessionSchema.index({ refreshToken: 1 }, { unique: true });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Add instance methods
sessionSchema.methods.isExpired = function() {
  return Date.now() >= this.expiresAt;
};

sessionSchema.methods.invalidate = function() {
  this.isValid = false;
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);
