class BaseDTO {
  static fromEntity(entity) {
    throw new Error('Method not implemented');
  }

  static toEntity(dto) {
    throw new Error('Method not implemented');
  }

  validate() {
    throw new Error('Method not implemented');
  }
}

module.exports = BaseDTO;
