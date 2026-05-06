const { z } = require('zod');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Product = require('../models/Product');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { sendOrderConfirmation } = require('../services/emailService');
const { recordInteraction } = require('../services/recommendationService');

const shippingSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(5),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(2),
  country: z.string().min(2).default('United States')
});

const createOrderSchema = z.object({
  shippingAddress: shippingSchema,
  paymentMethod: z.enum(['cash_on_delivery', 'stripe']).default('cash_on_delivery'),
  couponCode: z.string().optional()
});

async function calculateDiscount(code, subtotal) {
  if (!code) return { discount: 0, coupon: null };

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  const expired = coupon?.expiresAt && coupon.expiresAt < new Date();
  const exhausted = coupon?.usageLimit && coupon.usedCount >= coupon.usageLimit;

  if (!coupon || expired || exhausted || subtotal < coupon.minSubtotal) {
    throw new HttpError(400, 'Coupon is not valid for this cart');
  }

  const raw = coupon.type === 'percentage'
    ? subtotal * (coupon.value / 100)
    : coupon.value;

  return {
    discount: Math.min(subtotal, Number(raw.toFixed(2))),
    coupon
  };
}

const createOrder = asyncHandler(async (req, res) => {
  const body = createOrderSchema.parse(req.body);
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || !cart.items.length) {
    throw new HttpError(400, 'Cart is empty');
  }

  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isPublished) {
      throw new HttpError(400, 'One or more products are no longer available');
    }

    const sizeRow = item.size ? product.sizes.find((size) => size.label === item.size) : null;
    if (sizeRow && sizeRow.stock < item.quantity) {
      throw new HttpError(400, `${product.name} has only ${sizeRow.stock} left in ${item.size}`);
    }

    orderItems.push({
      product: product._id,
      productName: product.name,
      image: product.images[0]?.url,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: product.price
    });
  }

  const subtotal = Number(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  const shippingFee = subtotal >= 150 ? 0 : 9.95;
  const { discount, coupon } = await calculateDiscount(body.couponCode || cart.couponCode, subtotal);
  const totalPrice = Number((subtotal + shippingFee - discount).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    subtotal,
    discount,
    shippingFee,
    totalPrice,
    paymentMethod: body.paymentMethod,
    shippingAddress: body.shippingAddress,
    couponCode: coupon?.code,
    status: body.paymentMethod === 'stripe' ? 'paid' : 'pending',
    paidAt: body.paymentMethod === 'stripe' ? new Date() : undefined,
    timeline: [{
      status: body.paymentMethod === 'stripe' ? 'paid' : 'pending',
      note: body.paymentMethod === 'stripe' ? 'Stripe-ready simulated payment' : 'Cash on delivery selected'
    }]
  });

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const sizeRow = item.size ? product.sizes.find((size) => size.label === item.size) : null;
    if (sizeRow) sizeRow.stock = Math.max(0, sizeRow.stock - item.quantity);
    product.orderCount += item.quantity;
    await product.save();

    await recordInteraction({
      userId: req.user._id,
      productId: item.product,
      type: 'purchase',
      metadata: { quantity: item.quantity, orderId: order._id }
    });
  }

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  cart.items = [];
  cart.couponCode = undefined;
  await cart.save();

  await sendOrderConfirmation(order, req.user);

  res.status(201).json({ order });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'slug images');

  res.json({ orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user._id };

  const order = await Order.findOne(query).populate('items.product', 'slug images');
  if (!order) throw new HttpError(404, 'Order not found');
  res.json({ order });
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const query = req.query.status ? { status: req.query.status } : {};

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query)
  ]);

  res.json({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const body = z.object({
    status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
    note: z.string().optional()
  }).parse(req.body);

  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');

  order.status = body.status;
  order.timeline.push({ status: body.status, note: body.note });
  if (body.status === 'paid' && !order.paidAt) order.paidAt = new Date();
  if (body.status === 'delivered' && !order.deliveredAt) order.deliveredAt = new Date();
  await order.save();

  res.json({ order });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus
};

