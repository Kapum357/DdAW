const BaseRepository = require('./BaseRepository');
const Review = require('../models/Review');
const Order = require('../models/Order');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findOrderWithProduct(userId, productId) {
    return Order.findOne({
      user: userId,
      'items.product': productId,
      status: 'completed'
    });
  }

  async getStatistics(productId) {
    const stats = await this.model.aggregate([
      { $match: { product: productId, status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (!stats.length) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      };
    }

    const distribution = stats[0].ratingDistribution.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      ratingDistribution: {
        1: distribution[1] || 0,
        2: distribution[2] || 0,
        3: distribution[3] || 0,
        4: distribution[4] || 0,
        5: distribution[5] || 0
      }
    };
  }
}

module.exports = ReviewRepository;
