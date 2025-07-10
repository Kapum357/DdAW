class BaseService {
  constructor(repository, dto) {
    this.repository = repository;
    this.dto = dto;
  }

  async getAll(filter = {}, select = '', populate = '') {
    const entities = await this.repository.findAll(filter, select, populate);
    return entities.map(entity => this.dto.fromEntity(entity));
  }

  async getById(id, select = '', populate = '') {
    const entity = await this.repository.findById(id, select, populate);
    return entity ? this.dto.fromEntity(entity) : null;
  }

  async create(data) {
    const dto = new this.dto(data);
    dto.validate();
    const entity = this.dto.toEntity(dto);
    const created = await this.repository.create(entity);
    return this.dto.fromEntity(created);
  }

  async update(id, data) {
    const dto = new this.dto(data);
    dto.validate();
    const entity = this.dto.toEntity(dto);
    const updated = await this.repository.update(id, entity);
    return updated ? this.dto.fromEntity(updated) : null;
  }

  async delete(id) {
    return this.repository.delete(id);
  }
}

module.exports = BaseService;
