const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');
const AuthCode = require('../models/AuthCode');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');
const { sendAuthCode } = require('../services/emailService');

const accountTypeSchema = z.enum(['client', 'provider']);

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  accountType: accountTypeSchema.optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  website: z.string().optional(),
  adminCode: z.string().optional()
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

const requestCodeSchema = z.object({
  email: z.email(),
  mode: z.enum(['login', 'register']).default('login'),
  name: z.string().min(2).optional(),
  accountType: accountTypeSchema.optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  website: z.string().optional()
});

const verifyCodeSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/),
  mode: z.enum(['login', 'register']).default('login'),
  name: z.string().min(2).optional(),
  accountType: accountTypeSchema.optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  website: z.string().optional()
});

const googleSchema = z.object({
  idToken: z.string().min(20),
  accountType: accountTypeSchema.optional()
});

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function providerProfileFrom(body) {
  return {
    companyName: body.companyName,
    website: body.website
  };
}

function codeExpiresAt() {
  const ttlMinutes = Number(process.env.AUTH_CODE_TTL_MINUTES || 10);
  return new Date(Date.now() + ttlMinutes * 60 * 1000);
}

function shouldExposeMockCode(delivery) {
  // The current email service is mocked. Expose the code while mocked so account
  // creation works until a real provider is connected.
  return Boolean(delivery?.mock);
}

async function respondWithSession(res, user, statusCode = 200) {
  user.lastLoginAt = new Date();
  await user.save();

  res.status(statusCode).json({
    user: user.toSafeJSON(),
    token: generateToken(user._id)
  });
}

const register = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const email = normalizeEmail(body.email);
  const existing = await User.findOne({ email });

  if (existing) {
    throw new HttpError(409, 'Email is already registered');
  }

  const isAdmin = body.adminCode && body.adminCode === process.env.ADMIN_REGISTRATION_CODE;
  const user = await User.create({
    name: body.name,
    email,
    passwordHash: await bcrypt.hash(body.password, 12),
    role: isAdmin ? 'admin' : 'user',
    accountType: body.accountType || 'client',
    authProvider: 'local',
    phone: body.phone,
    providerProfile: body.accountType === 'provider' ? providerProfileFrom(body) : undefined
  });

  await respondWithSession(res, user, 201);
});

const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ email: normalizeEmail(body.email) });

  if (!user || !user.passwordHash || !await bcrypt.compare(body.password, user.passwordHash)) {
    throw new HttpError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new HttpError(403, 'Account is disabled');
  }

  await respondWithSession(res, user);
});

const requestEmailCode = asyncHandler(async (req, res) => {
  const body = requestCodeSchema.parse(req.body);
  const email = normalizeEmail(body.email);
  const existing = await User.findOne({ email });

  if (body.mode === 'register' && existing) {
    throw new HttpError(409, 'Email is already registered');
  }

  if (body.mode === 'login' && !existing) {
    throw new HttpError(404, 'No account found for this email');
  }

  const code = String(crypto.randomInt(100000, 1000000));
  await AuthCode.deleteMany({ email, mode: body.mode, consumedAt: null });
  await AuthCode.create({
    email,
    mode: body.mode,
    name: body.name,
    accountType: body.accountType || 'client',
    phone: body.phone,
    companyName: body.companyName,
    website: body.website,
    codeHash: await bcrypt.hash(code, 10),
    expiresAt: codeExpiresAt()
  });

  const delivery = await sendAuthCode(email, code, body.mode);
  const payload = {
    message: 'Verification code sent',
    expiresInMinutes: Number(process.env.AUTH_CODE_TTL_MINUTES || 10)
  };

  if (shouldExposeMockCode(delivery)) {
    payload.devCode = code;
  }

  res.json(payload);
});

const verifyEmailCode = asyncHandler(async (req, res) => {
  const body = verifyCodeSchema.parse(req.body);
  const email = normalizeEmail(body.email);
  const authCode = await AuthCode.findOne({
    email,
    mode: body.mode,
    consumedAt: null,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!authCode) {
    throw new HttpError(400, 'Verification code expired. Request a new one.');
  }

  if (authCode.attempts >= 5) {
    throw new HttpError(429, 'Too many code attempts. Request a new code.');
  }

  const matches = await bcrypt.compare(body.code, authCode.codeHash);
  if (!matches) {
    authCode.attempts += 1;
    await authCode.save();
    throw new HttpError(400, 'Invalid verification code');
  }

  authCode.consumedAt = new Date();
  await authCode.save();

  let user = await User.findOne({ email });
  if (body.mode === 'register') {
    if (user) {
      throw new HttpError(409, 'Email is already registered');
    }

    user = await User.create({
      name: body.name || authCode.name || email.split('@')[0],
      email,
      accountType: body.accountType || authCode.accountType || 'client',
      authProvider: 'email_code',
      phone: body.phone || authCode.phone,
      providerProfile: (body.accountType || authCode.accountType) === 'provider'
        ? providerProfileFrom({
          companyName: body.companyName || authCode.companyName,
          website: body.website || authCode.website
        })
        : undefined,
      role: 'user'
    });
  }

  if (!user) {
    throw new HttpError(404, 'No account found for this email');
  }

  if (!user.isActive) {
    throw new HttpError(403, 'Account is disabled');
  }

  await respondWithSession(res, user, body.mode === 'register' ? 201 : 200);
});

const googleAuth = asyncHandler(async (req, res) => {
  const body = googleSchema.parse(req.body);
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    throw new HttpError(503, 'Google sign-in is not configured yet');
  }

  const tokenResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.idToken)}`);
  if (!tokenResponse.ok) {
    throw new HttpError(401, 'Invalid Google token');
  }

  const profile = await tokenResponse.json();
  if (profile.aud !== googleClientId) {
    throw new HttpError(401, 'Google token audience mismatch');
  }

  if (profile.email_verified !== true && profile.email_verified !== 'true') {
    throw new HttpError(401, 'Google email is not verified');
  }

  const email = normalizeEmail(profile.email);
  let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email }] });
  if (!user) {
    user = await User.create({
      name: profile.name || email.split('@')[0],
      email,
      googleId: profile.sub,
      accountType: body.accountType || 'client',
      authProvider: 'google',
      role: 'user'
    });
  } else {
    user.googleId = user.googleId || profile.sub;
    user.authProvider = 'google';
  }

  if (!user.isActive) {
    throw new HttpError(403, 'Account is disabled');
  }

  await respondWithSession(res, user, user.createdAt && Date.now() - user.createdAt.getTime() < 5000 ? 201 : 200);
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, requestEmailCode, verifyEmailCode, googleAuth, me };
