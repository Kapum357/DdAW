class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(filter = {}, select = '', populate = '') {
    return this.model.find(filter).select(select).populate(populate);
  }

  async findById(id, select = '', populate = '') {
    return this.model.findById(id).select(select).populate(populate);
  }

  async findOne(filter = {}, select = '', populate = '') {
    return this.model.findOne(filter).select(select).populate(populate);
  }

  async create(data) {
    const entity = new this.model(data);
    return entity.save();
  }

  async update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = BaseRepository;
