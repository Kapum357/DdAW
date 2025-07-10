const BaseService = require('./BaseService');
const ReviewRepository = require('../repositories/ReviewRepository');
const ReviewDTO = require('../dto/ReviewDTO');
const createError = require('http-errors');

class ReviewService extends BaseService {
  constructor() {
    super(new ReviewRepository(), ReviewDTO);
  }

  async createReview(userId, reviewData) {
    // Check if user has purchased the product
    const order = await this.repository.findOrderWithProduct(userId, reviewData.productId);
    if (!order) {
      throw createError(403, 'You can only review products you have purchased');
    }

    // Check if user already reviewed this product
    const existingReview = await this.repository.findOne({
      user: userId,
      product: reviewData.productId
    });
    if (existingReview) {
      throw createError(400, 'You have already reviewed this product');
    }

    const dto = new ReviewDTO({
      ...reviewData,
      user: userId,
      order: order._id
    });
    dto.validate();

    const review = await this.repository.create(ReviewDTO.toEntity(dto));
    return ReviewDTO.fromEntity(review);
  }

  async updateReview(userId, reviewId, updateData) {
    const review = await this.repository.findById(reviewId);
    
    if (!review) {
      throw createError(404, 'Review not found');
    }

    if (review.user.toString() !== userId.toString()) {
      throw createError(403, 'You can only edit your own reviews');
    }

    if (!review.isEditable()) {
      throw createError(403, 'Review can no longer be edited');
    }

    const dto = new ReviewDTO({
      ...review.toObject(),
      ...updateData
    });
    dto.validate();

    const updated = await this.repository.update(reviewId, ReviewDTO.toEntity(dto));
    return ReviewDTO.fromEntity(updated);
  }

  async getProductReviews(productId, options = {}) {
    const reviews = await this.repository.findAll(
      { product: productId, status: 'approved' },
      '',
      'user'
    );
    return reviews.map(review => ReviewDTO.fromEntity(review));
  }

  async getUserReviews(userId) {
    const reviews = await this.repository.findAll(
      { user: userId },
      '',
      'product'
    );
    return reviews.map(review => ReviewDTO.fromEntity(review));
  }

  async getReviewStatistics(productId) {
    return this.repository.getStatistics(productId);
  }
}

module.exports = ReviewService;
