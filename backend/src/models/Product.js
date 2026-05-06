const mongoose = require('mongoose');

const SizeSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: false });

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, trim: true },
  variant: { type: String, trim: true }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Men', 'Women', 'Accessories'], required: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  colors: [{ type: String, trim: true }],
  sizes: [SizeSchema],
  images: [ImageSchema],
  benefits: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  material: { type: String, trim: true },
  ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, min: 0, default: 0 },
  viewCount: { type: Number, min: 0, default: 0 },
  orderCount: { type: Number, min: 0, default: 0 },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

ProductSchema.virtual('stock').get(function getStock() {
  return this.sizes.reduce((total, size) => total + size.stock, 0);
});

ProductSchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ viewCount: -1, orderCount: -1 });

module.exports = mongoose.model('Product', ProductSchema);

