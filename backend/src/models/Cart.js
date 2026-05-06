const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  size: { type: String, trim: true },
  color: { type: String, trim: true },
  priceSnapshot: { type: Number, required: true, min: 0 }
}, { _id: true });

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
  couponCode: { type: String, uppercase: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);

