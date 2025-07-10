const BaseDTO = require('./BaseDTO');
const { validatePasswordStrength } = require('../middleware/security');

class UserDTO extends BaseDTO {
  constructor(data) {
    super();
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'client';
  }

  static fromEntity(entity) {
    return new UserDTO({
      id: entity._id,
      username: entity.username,
      email: entity.email,
      role: entity.role
    });
  }

  static toEntity(dto) {
    return {
      username: dto.username,
      email: dto.email,
      password: dto.password,
      role: dto.role
    };
  }

  validate() {
    const errors = [];

    // Username validation
    if (!this.username || typeof this.username !== 'string' || this.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(this.username)) {
      errors.push('Username can only contain letters, numbers, underscores and hyphens');
    }

    // Email validation
    if (!this.email || typeof this.email !== 'string') {
      errors.push('Email is required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('Invalid email format');
    }

    // Password validation (only if password is provided - for updates it might not be)
    if (this.password) {
      const passwordError = validatePasswordStrength(this.password);
      if (passwordError) {
        errors.push(passwordError);
      }
    }

    // Role validation
    if (!['client', 'pos_operator', 'admin'].includes(this.role)) {
      errors.push('Invalid role');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}

module.exports = UserDTO;
