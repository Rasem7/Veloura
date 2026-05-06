const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductReviews,
  addProductReview
} = require('../controllers/productController');
const { protect, optionalAuth, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, adminOnly, createProduct);
router.get('/:idOrSlug', optionalAuth, getProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, addProductReview);

module.exports = router;

