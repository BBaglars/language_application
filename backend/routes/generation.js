const express = require('express');
const router = express.Router();
const generationController = require('../controllers/generationController');
const { authenticate } = require('../middleware/auth.middleware');

// Metin üretme endpoint'i
router.post('/generate', authenticate, generationController.generateText);

module.exports = router; 