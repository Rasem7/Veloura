const { z } = require('zod');
const asyncHandler = require('../utils/asyncHandler');
const { recordInteraction } = require('../services/recommendationService');

const interactionSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(['view', 'click', 'cart', 'purchase']),
  sessionId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

const createInteraction = asyncHandler(async (req, res) => {
  const body = interactionSchema.parse(req.body);
  const interaction = await recordInteraction({
    userId: req.user?._id,
    sessionId: body.sessionId,
    productId: body.productId,
    type: body.type,
    metadata: body.metadata
  });

  res.status(201).json({ interaction });
});

module.exports = { createInteraction };

