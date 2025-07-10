const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  async findByUsername(username) {
    return this.model.findOne({ username });
  }

  async createUser(userData) {
    const user = new this.model(userData);
    return user.save();
  }
}

module.exports = UserRepository;
