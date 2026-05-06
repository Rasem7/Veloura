const express = require('express');
const { createInteraction } = require('../controllers/interactionController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', optionalAuth, createInteraction);

module.exports = router;

