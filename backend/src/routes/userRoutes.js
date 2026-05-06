const express = require('express');
const { listUsers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, adminOnly, listUsers);

module.exports = router;

