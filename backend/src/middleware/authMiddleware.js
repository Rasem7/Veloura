const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new HttpError(401, 'Authentication required');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-passwordHash');

  if (!user || !user.isActive) {
    throw new HttpError(401, 'User not found or disabled');
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
  } catch (_error) {
    req.user = null;
  }

  next();
});

function adminOnly(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    next(new HttpError(403, 'Admin access required'));
    return;
  }

  next();
}

module.exports = { protect, optionalAuth, adminOnly };

