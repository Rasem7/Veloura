const express = require('express');
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listUserStats
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, adminOnly, listUsers);
router.get('/stats', protect, adminOnly, listUserStats);
router.get('/:id', protect, adminOnly, getUser);
router.post('/', protect, adminOnly, createUser);
router.put('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
