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

// Ana route'u tanımla
router.get('/', (req, res) => {
  res.json({
    message: 'API çalışıyor',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      words: '/api/words',
      categories: '/api/categories',
      games: '/api/games',
      stories: '/api/stories'
    }
  });
});

// Router'ı dışa aktar
module.exports = router; 