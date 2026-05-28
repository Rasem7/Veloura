const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  fullName: { type: String, trim: true },
  phone: { type: String, trim: true },
  line1: { type: String, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  country: { type: String, trim: true, default: 'United States' }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  accountType: { type: String, enum: ['client', 'provider'], default: 'client', index: true },
  authProvider: { type: String, enum: ['local', 'email_code', 'google'], default: 'local' },
  googleId: { type: String, unique: true, sparse: true },
  phone: { type: String, trim: true },
  providerProfile: {
    companyName: { type: String, trim: true },
    website: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  addresses: [AddressSchema],
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, { timestamps: true });

UserSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    _id: this._id,
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    accountType: this.accountType,
    authProvider: this.authProvider,
    phone: this.phone,
    providerProfile: this.providerProfile,
    addresses: this.addresses,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', UserSchema);
