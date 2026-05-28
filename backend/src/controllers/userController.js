const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

const roleSchema = z.enum(['user', 'admin']);
const accountTypeSchema = z.enum(['client', 'provider']);
const providerStatusSchema = z.enum(['pending', 'approved', 'rejected']);

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  role: roleSchema.default('user'),
  accountType: accountTypeSchema.default('client'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  website: z.string().optional(),
  providerStatus: providerStatusSchema.optional(),
  isActive: z.boolean().optional()
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.email().optional(),
  password: z.string().min(8).optional(),
  role: roleSchema.optional(),
  accountType: accountTypeSchema.optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  website: z.string().optional(),
  providerStatus: providerStatusSchema.optional(),
  isActive: z.boolean().optional()
});

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function providerProfileFrom(body, current = {}) {
  return {
    companyName: body.companyName ?? current.companyName,
    website: body.website ?? current.website,
    status: body.providerStatus ?? current.status ?? 'pending'
  };
}

const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 100), 1), 200);
  const query = {};

  if (['client', 'provider'].includes(req.query.accountType)) {
    query.accountType = req.query.accountType;
  }

  if (['user', 'admin'].includes(req.query.role)) {
    query.role = req.query.role;
  }

  if (req.query.status === 'active') {
    query.isActive = true;
  }

  if (req.query.status === 'inactive') {
    query.isActive = false;
  }

  if (req.query.search) {
    const search = new RegExp(req.query.search, 'i');
    query.$or = [
      { name: search },
      { email: search },
      { phone: search },
      { 'providerProfile.companyName': search }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(query)
  ]);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  res.json({ user });
});

const createUser = asyncHandler(async (req, res) => {
  const body = createUserSchema.parse(req.body);
  const email = normalizeEmail(body.email);
  const existing = await User.findOne({ email });

  if (existing) {
    throw new HttpError(409, 'Email is already registered');
  }

  const user = await User.create({
    name: body.name,
    email,
    passwordHash: await bcrypt.hash(body.password, 12),
    role: body.role,
    accountType: body.accountType,
    authProvider: 'local',
    phone: body.phone,
    providerProfile: body.accountType === 'provider' ? providerProfileFrom(body) : undefined,
    isActive: body.isActive ?? true
  });

  res.status(201).json({ user: user.toSafeJSON() });
});

const updateUser = asyncHandler(async (req, res) => {
  const body = updateUserSchema.parse(req.body);
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const isSelf = user._id.toString() === req.user._id.toString();
  if (isSelf && body.role && body.role !== 'admin') {
    throw new HttpError(400, 'You cannot remove your own admin role');
  }

  if (isSelf && body.isActive === false) {
    throw new HttpError(400, 'You cannot disable your own account');
  }

  if (body.email && normalizeEmail(body.email) !== user.email) {
    const existing = await User.findOne({ email: normalizeEmail(body.email), _id: { $ne: user._id } });
    if (existing) {
      throw new HttpError(409, 'Email is already registered');
    }
    user.email = normalizeEmail(body.email);
  }

  if (body.name !== undefined) user.name = body.name;
  if (body.role !== undefined) user.role = body.role;
  if (body.accountType !== undefined) user.accountType = body.accountType;
  if (body.phone !== undefined) user.phone = body.phone;
  if (body.isActive !== undefined) user.isActive = body.isActive;
  if (body.password) {
    user.passwordHash = await bcrypt.hash(body.password, 12);
    user.authProvider = user.authProvider === 'google' ? 'local' : user.authProvider;
  }

  if (user.accountType === 'provider') {
    user.providerProfile = providerProfileFrom(body, user.providerProfile);
  } else {
    user.providerProfile = undefined;
  }

  await user.save();
  res.json({ user: user.toSafeJSON() });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new HttpError(400, 'You cannot disable your own account');
  }

  user.isActive = false;
  await user.save();

  res.json({ message: 'User disabled', user: user.toSafeJSON() });
});

const listUserStats = asyncHandler(async (_req, res) => {
  const [clients, providers, active, disabled] = await Promise.all([
    User.countDocuments({ accountType: 'client' }),
    User.countDocuments({ accountType: 'provider' }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false })
  ]);

  res.json({ clients, providers, active, disabled });
});

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listUserStats
};
