const express = require('express');
const {
  register,
  login,
  requestEmailCode,
  verifyEmailCode,
  googleAuth,
  me
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/code/request', requestEmailCode);
router.post('/code/verify', verifyEmailCode);
router.post('/google', googleAuth);
router.get('/me', protect, me);

module.exports = router;
