const mongoose = require('mongoose');

const ShippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: 'United States' }
}, { _id: false });

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  image: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, trim: true },
  color: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 }
}, { _id: true });

const TimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    required: true
  },
  at: { type: Date, default: Date.now },
  note: { type: String, trim: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, min: 0, default: 0 },
  shippingFee: { type: Number, required: true, min: 0, default: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'stripe'],
    default: 'cash_on_delivery'
  },
  shippingAddress: ShippingAddressSchema,
  couponCode: { type: String, uppercase: true, trim: true },
  timeline: [TimelineSchema],
  paidAt: Date,
  deliveredAt: Date
}, { timestamps: true });

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);

