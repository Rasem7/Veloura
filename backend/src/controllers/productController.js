const mongoose = require('mongoose');
const { z } = require('zod');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { recordInteraction } = require('../services/recommendationService');

const sizeSchema = z.object({
  label: z.string().min(1),
  stock: z.number().min(0)
});

const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional(),
  variant: z.string().optional()
});

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().min(10),
  category: z.enum(['Men', 'Women', 'Accessories']),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  colors: z.array(z.string()).default([]),
  sizes: z.array(sizeSchema).default([]),
  images: z.array(imageSchema).default([]),
  benefits: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  material: z.string().optional(),
  isPublished: z.boolean().default(true)
});

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional()
});

const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48);
  const query = { isPublished: true };

  if (req.query.category) query.category = req.query.category;
  if (req.query.search) query.$text = { $search: req.query.search };
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  const sortMap = {
    latest: { createdAt: -1 },
    trending: { orderCount: -1, viewCount: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { ratingAverage: -1 }
  };

  const sort = sortMap[req.query.sort] || sortMap.trending;
  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(query)
  ]);

  res.json({
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const key = req.params.idOrSlug;
  const query = mongoose.Types.ObjectId.isValid(key) ? { _id: key } : { slug: key };
  const product = await Product.findOne({ ...query, isPublished: true });

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  if (req.query.trackView !== 'false') {
    await recordInteraction({
      userId: req.user?._id,
      sessionId: req.query.sessionId,
      productId: product._id,
      type: 'view',
      metadata: { source: 'product_detail' }
    });
  }

  res.json({ product });
});

const createProduct = asyncHandler(async (req, res) => {
  const body = productSchema.parse(req.body);
  const product = await Product.create(body);
  res.status(201).json({ product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const body = productSchema.partial().parse(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true
  });

  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.status(204).send();
});

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json({ reviews });
});

const addProductReview = asyncHandler(async (req, res) => {
  const body = reviewSchema.parse(req.body);
  const product = await Product.findById(req.params.id);

  if (!product) throw new HttpError(404, 'Product not found');

  const purchased = await Order.exists({
    user: req.user._id,
    'items.product': product._id,
    status: { $ne: 'cancelled' }
  });

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, product: product._id },
    {
      user: req.user._id,
      product: product._id,
      rating: body.rating,
      title: body.title,
      comment: body.comment,
      isVerifiedPurchase: Boolean(purchased)
    },
    { new: true, upsert: true, runValidators: true }
  );

  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  await Product.findByIdAndUpdate(product._id, {
    ratingAverage: Number((stats[0]?.average || 0).toFixed(1)),
    reviewCount: stats[0]?.count || 0
  });

  res.status(201).json({ review });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductReviews,
  addProductReview
};

