const BaseService = require('./BaseService');
const ServicePointRepository = require('../repositories/ServicePointRepository');
const ServicePointDTO = require('../dto/ServicePointDTO');
const createError = require('http-errors');

class ServicePointService extends BaseService {
  constructor() {
    super(new ServicePointRepository(), ServicePointDTO);
  }

  async findNearest(latitude, longitude, maxDistance = 10000) {
    if (!latitude || !longitude) {
      throw createError(400, 'Latitude and longitude are required');
    }

    const point = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    const nearestPoint = await this.repository.findNearest(point, maxDistance);
    
    if (!nearestPoint) {
      throw createError(404, 'No service points found within the specified distance');
    }

    return ServicePointDTO.fromEntity(nearestPoint);
  }

  async findInRadius(latitude, longitude, radius = 5000) {
    if (!latitude || !longitude) {
      throw createError(400, 'Latitude and longitude are required');
    }

    const point = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    const points = await this.repository.findInRadius(point, radius);
    return points.map(point => ServicePointDTO.fromEntity(point));
  }

  async getActivePoints() {
    const points = await this.repository.findAll({ status: 'active' });
    return points.map(point => ServicePointDTO.fromEntity(point));
  }

  async checkAvailability(servicePointId) {
    const point = await this.repository.findById(servicePointId);
    
    if (!point) {
      throw createError(404, 'Service point not found');
    }

    if (point.status !== 'active') {
      return { available: false, reason: 'Service point is currently inactive' };
    }

    if (!point.isOpen()) {
      return { available: false, reason: 'Service point is currently closed' };
    }

    return { available: true };
  }

  async updateStatus(servicePointId, status) {
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      throw createError(400, 'Invalid status');
    }

    const point = await this.repository.update(servicePointId, { status });
    if (!point) {
      throw createError(404, 'Service point not found');
    }

    return ServicePointDTO.fromEntity(point);
  }

  async updateOperatingHours(servicePointId, hours) {
    const point = await this.repository.findById(servicePointId);
    if (!point) {
      throw createError(404, 'Service point not found');
    }

    // Validate hours format
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    for (const day of days) {
      if (hours[day]) {
        if (hours[day].open && !timeRegex.test(hours[day].open)) {
          throw createError(400, `Invalid opening time format for ${day}`);
        }
        if (hours[day].close && !timeRegex.test(hours[day].close)) {
          throw createError(400, `Invalid closing time format for ${day}`);
        }
      }
    }

    const updated = await this.repository.update(servicePointId, {
      operatingHours: hours
    });

    return ServicePointDTO.fromEntity(updated);
  }
}

module.exports = ServicePointService;
