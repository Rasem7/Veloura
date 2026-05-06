const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getSalesStats = asyncHandler(async (_req, res) => {
  const [summary] = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  const byDay = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 14 }
  ]);

  const [productCount, userCount, topProducts] = await Promise.all([
    Product.countDocuments({ isPublished: true }),
    User.countDocuments({ isActive: true }),
    Product.find({ isPublished: true }).sort({ orderCount: -1, viewCount: -1 }).limit(5)
  ]);

  res.json({
    revenue: summary?.revenue || 0,
    orders: summary?.orders || 0,
    averageOrderValue: summary?.averageOrderValue || 0,
    productCount,
    userCount,
    byDay,
    topProducts
  });
});

module.exports = { getSalesStats };

