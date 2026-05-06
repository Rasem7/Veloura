const asyncHandler = require('../utils/asyncHandler');
const { buildRecommendations } = require('../services/recommendationService');

const getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await buildRecommendations(req.params.userId, req.query.productId);
  res.json(recommendations);
});

module.exports = { getRecommendations };

