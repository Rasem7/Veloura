const express = require('express');
const { getSalesStats } = require('../controllers/statsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, adminOnly, getSalesStats);

module.exports = router;

