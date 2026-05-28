const mongoose = require('mongoose');

const AuthCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  codeHash: { type: String, required: true },
  mode: { type: String, enum: ['login', 'register'], required: true, index: true },
  name: { type: String, trim: true },
  accountType: { type: String, enum: ['client', 'provider'], default: 'client' },
  phone: { type: String, trim: true },
  companyName: { type: String, trim: true },
  website: { type: String, trim: true },
  attempts: { type: Number, default: 0 },
  consumedAt: Date,
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

module.exports = mongoose.model('AuthCode', AuthCodeSchema);
