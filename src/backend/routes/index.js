const express = require('express');
const router = express.Router();

// Alt rotaları içe aktar
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const wordRoutes = require('./wordRoutes');
const categoryRoutes = require('./categoryRoutes');
const gameRoutes = require('./gameRoutes');
const storyRoutes = require('./storyRoutes');

// Rotaları birleştir
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/words', wordRoutes);
router.use('/categories', categoryRoutes);
router.use('/games', gameRoutes);
router.use('/stories', storyRoutes);

module.exports = router; 