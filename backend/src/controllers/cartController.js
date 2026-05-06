const { z } = require('zod');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { recordInteraction } = require('../services/recommendationService');

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  size: z.string().optional(),
  color: z.string().optional()
});

async function populateCart(cart) {
  return cart.populate('items.product');
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

async function addOrMergeItem(cart, item) {
  const product = await Product.findById(item.productId);
  if (!product || !product.isPublished) {
    throw new HttpError(404, 'Product not found');
  }

  const sizeStock = item.size ? product.sizes.find((size) => size.label === item.size) : null;
  if (sizeStock && sizeStock.stock < item.quantity) {
    throw new HttpError(400, `Only ${sizeStock.stock} items left in ${item.size}`);
  }

  const existing = cart.items.find((row) =>
    row.product.toString() === product._id.toString() &&
    (row.size || '') === (item.size || '') &&
    (row.color || '') === (item.color || '')
  );

  if (existing) {
    existing.quantity += item.quantity;
    existing.priceSnapshot = product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      priceSnapshot: product.price
    });
  }

  await recordInteraction({
    userId: cart.user,
    productId: product._id,
    type: 'cart',
    metadata: { quantity: item.quantity, size: item.size, color: item.color }
  });
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await populateCart(await getOrCreateCart(req.user._id));
  res.json({ cart });
});

const syncCart = asyncHandler(async (req, res) => {
  const body = z.object({ items: z.array(cartItemSchema).default([]) }).parse(req.body);
  const cart = await getOrCreateCart(req.user._id);

  for (const item of body.items) {
    await addOrMergeItem(cart, item);
  }

  await cart.save();
  res.json({ cart: await populateCart(cart) });
});

const addItem = asyncHandler(async (req, res) => {
  const body = cartItemSchema.parse(req.body);
  const cart = await getOrCreateCart(req.user._id);

  await addOrMergeItem(cart, body);
  await cart.save();

  res.status(201).json({ cart: await populateCart(cart) });
});

const updateItem = asyncHandler(async (req, res) => {
  const body = z.object({ quantity: z.number().int().min(1) }).parse(req.body);
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);

  if (!item) throw new HttpError(404, 'Cart item not found');

  item.quantity = body.quantity;
  await cart.save();

  res.json({ cart: await populateCart(cart) });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);

  if (!item) throw new HttpError(404, 'Cart item not found');

  item.deleteOne();
  await cart.save();

  res.json({ cart: await populateCart(cart) });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.couponCode = undefined;
  await cart.save();
  res.json({ cart });
});

module.exports = { getCart, syncCart, addItem, updateItem, removeItem, clearCart };

