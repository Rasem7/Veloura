const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, trim: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['view', 'click', 'cart', 'purchase'], required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

InteractionSchema.index({ user: 1, createdAt: -1 });
InteractionSchema.index({ product: 1, type: 1 });
InteractionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Interaction', InteractionSchema);

