const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ users });
});

module.exports = { listUsers };

