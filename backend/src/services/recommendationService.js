const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Interaction = require('../models/Interaction');

function uniqueProducts(products, limit = 8) {
  const seen = new Set();
  return products.filter((product) => {
    const id = product._id.toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, limit);
}

async function getRecentlyViewed(userId, limit = 8) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return [];

  const rows = await Interaction.find({ user: userId, type: 'view' })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('product');

  return uniqueProducts(
    rows.map((row) => row.product).filter((product) => product && product.isPublished),
    limit
  );
}

async function getTrendingProducts(limit = 8) {
  return Product.find({ isPublished: true })
    .sort({ orderCount: -1, viewCount: -1, ratingAverage: -1, createdAt: -1 })
    .limit(limit);
}

async function getSimilarProducts(anchorProducts, limit = 8) {
  const anchors = anchorProducts.filter(Boolean);
  if (!anchors.length) return getTrendingProducts(limit);

  const categories = [...new Set(anchors.map((product) => product.category))];
  const averagePrice = anchors.reduce((sum, product) => sum + product.price, 0) / anchors.length;
  const excludeIds = anchors.map((product) => product._id);

  return Product.find({
    _id: { $nin: excludeIds },
    category: { $in: categories },
    price: { $gte: Math.max(0, averagePrice * 0.65), $lte: averagePrice * 1.45 },
    isPublished: true
  })
    .sort({ ratingAverage: -1, orderCount: -1, viewCount: -1 })
    .limit(limit);
}

async function getFrequentlyBoughtTogether(anchorProductIds, limit = 8) {
  const ids = anchorProductIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!ids.length) return [];

  const rows = await Order.aggregate([
    { $match: { 'items.product': { $in: ids }, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $match: { 'items.product': { $nin: ids } } },
    { $group: { _id: '$items.product', score: { $sum: '$items.quantity' } } },
    { $sort: { score: -1 } },
    { $limit: limit }
  ]);

  const rankedIds = rows.map((row) => row._id);
  const products = await Product.find({ _id: { $in: rankedIds }, isPublished: true });
  const byId = new Map(products.map((product) => [product._id.toString(), product]));
  return rankedIds.map((id) => byId.get(id.toString())).filter(Boolean);
}

async function buildRecommendations(userId, contextProductId) {
  const recentlyViewed = await getRecentlyViewed(userId, 8);
  const contextProduct = mongoose.Types.ObjectId.isValid(contextProductId || '')
    ? await Product.findById(contextProductId)
    : null;

  const anchors = contextProduct ? [contextProduct, ...recentlyViewed] : recentlyViewed;
  const anchorIds = anchors.map((product) => product._id.toString());
  const [frequentlyBoughtTogether, similarProducts, trendingProducts] = await Promise.all([
    getFrequentlyBoughtTogether(anchorIds, 8),
    getSimilarProducts(anchors, 8),
    getTrendingProducts(8)
  ]);

  const recommendedForYou = uniqueProducts([
    ...frequentlyBoughtTogether,
    ...similarProducts,
    ...trendingProducts
  ], 10);

  return {
    recentlyViewed,
    frequentlyBoughtTogether,
    similarProducts,
    trendingProducts,
    recommendedForYou
  };
}

async function recordInteraction({ userId, sessionId, productId, type, metadata }) {
  if (!mongoose.Types.ObjectId.isValid(productId)) return null;

  const interaction = await Interaction.create({
    user: mongoose.Types.ObjectId.isValid(userId || '') ? userId : undefined,
    sessionId,
    product: productId,
    type,
    metadata
  });

  if (type === 'view') {
    await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });
  }

  if (type === 'purchase') {
    await Product.findByIdAndUpdate(productId, { $inc: { orderCount: metadata?.quantity || 1 } });
  }

  return interaction;
}

module.exports = {
  buildRecommendations,
  recordInteraction,
  getTrendingProducts,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getRecentlyViewed
};

