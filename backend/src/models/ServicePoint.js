const mongoose = require('mongoose');

const servicePointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  contactInfo: {
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
servicePointSchema.index({ location: '2dsphere' });

// Virtual for latitude
servicePointSchema.virtual('latitude').get(function() {
  return this.location.coordinates[1];
});

// Virtual for longitude
servicePointSchema.virtual('longitude').get(function() {
  return this.location.coordinates[0];
});

// Instance method to check if service point is open
servicePointSchema.methods.isOpen = function() {
  const now = new Date();
  const day = now.toLocaleLowerCase().slice(0, 3);
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  
  const hours = this.operatingHours[day];
  if (!hours || !hours.open || !hours.close) return false;
  
  return time >= hours.open && time <= hours.close;
};

module.exports = mongoose.model('ServicePoint', servicePointSchema);
