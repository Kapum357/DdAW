const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    trim: true,
    match: /^[a-zA-Z0-9_-]+$/,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password in normal queries
  },
  role: {
    type: String,
    enum: ['client', 'pos_operator', 'admin'],
    default: 'client',
    index: true
  },
  version: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true
  },
  lastLogin: {
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  },
  securitySettings: {
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    passwordLastChanged: {
      type: Date,
      default: Date.now
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockoutUntil: Date
  },
  sessions: [{
    token: String,
    lastActivity: {
      type: Date,
      default: Date.now
    },
    deviceInfo: {
      userAgent: String,
      ipAddress: String
    },
    isValid: {
      type: Boolean,
      default: true
    }
  }],
  activityLog: [{
    action: {
      type: String,
      enum: ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PROFILE_UPDATE', 'ROLE_CHANGE'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  optimisticConcurrency: true
});

// Index for session management
userSchema.index({ "sessions.token": 1 });
userSchema.index({ "sessions.lastActivity": 1 });

// Compound indexes for common queries
userSchema.index({ role: 1, status: 1 });

// Pre-save middleware for version control and password hashing
userSchema.pre('save', async function(next) {
  this.version += 1;

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.securitySettings.passwordLastChanged = new Date();
  }

  next();
});

// Method to safely update user with optimistic concurrency
userSchema.statics.updateWithConcurrency = async function(id, updateData, version) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await this.findOne({ _id: id, version: version }).session(session);
    if (!user) {
      throw new Error('Concurrent modification detected. Please refresh and try again.');
    }

    Object.assign(user, updateData);
    await user.save({ session });
    await session.commitTransaction();
    return user;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Method to handle login attempt
userSchema.methods.handleLoginAttempt = async function(success, ipAddress, userAgent) {
  if (success) {
    // Reset failed attempts on successful login
    this.securitySettings.failedLoginAttempts = 0;
    this.securitySettings.lockoutUntil = null;
    this.lastLogin = {
      timestamp: new Date(),
      ipAddress,
      userAgent
    };
  } else {
    // Increment failed attempts
    this.securitySettings.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.securitySettings.failedLoginAttempts >= 5) {
      this.securitySettings.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
  }

  // Log the activity
  this.activityLog.push({
    action: success ? 'LOGIN' : 'LOGIN_FAILED',
    ipAddress,
    userAgent,
    details: {
      success,
      failedAttempts: this.securitySettings.failedLoginAttempts
    }
  });

  return this.save();
};

// Method to add a new session
userSchema.methods.addSession = async function(token, deviceInfo) {
  this.sessions.push({
    token,
    deviceInfo
  });
  return this.save();
};

// Method to invalidate a session
userSchema.methods.invalidateSession = async function(token) {
  const session = this.sessions.find(s => s.token === token);
  if (session) {
    session.isValid = false;
  }
  return this.save();
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.sessions;
  delete obj.securitySettings;
  return obj;
};

const User = mongoose.model('User', userSchema);

// Create necessary indexes
User.syncIndexes();

module.exports = User;
