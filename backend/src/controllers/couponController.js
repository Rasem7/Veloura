const { z } = require('zod');
const Coupon = require('../models/Coupon');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

const applyCoupon = asyncHandler(async (req, res) => {
  const body = z.object({
    code: z.string().min(2),
    subtotal: z.number().min(0)
  }).parse(req.body);

  const coupon = await Coupon.findOne({ code: body.code.toUpperCase(), isActive: true });

  if (!coupon) throw new HttpError(404, 'Coupon not found');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new HttpError(400, 'Coupon expired');
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new HttpError(400, 'Coupon usage limit reached');
  if (body.subtotal < coupon.minSubtotal) throw new HttpError(400, `Minimum subtotal is ${coupon.minSubtotal}`);

  const discount = coupon.type === 'percentage'
    ? body.subtotal * (coupon.value / 100)
    : coupon.value;

  res.json({
    coupon,
    discount: Math.min(body.subtotal, Number(discount.toFixed(2)))
  });
});

module.exports = { applyCoupon };

