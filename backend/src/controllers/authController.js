const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  adminCode: z.string().optional()
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

const register = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: body.email });

  if (existing) {
    throw new HttpError(409, 'Email is already registered');
  }

  const isAdmin = body.adminCode && body.adminCode === process.env.ADMIN_REGISTRATION_CODE;
  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash: await bcrypt.hash(body.password, 12),
    role: isAdmin ? 'admin' : 'user'
  });

  res.status(201).json({
    user: user.toSafeJSON(),
    token: generateToken(user._id)
  });
});

const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ email: body.email });

  if (!user || !await bcrypt.compare(body.password, user.passwordHash)) {
    throw new HttpError(401, 'Invalid email or password');
  }

  res.json({
    user: user.toSafeJSON(),
    token: generateToken(user._id)
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, me };

