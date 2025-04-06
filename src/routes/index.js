const express = require('express');
const router = express.Router();

// Route modüllerini içe aktarma
const authRoutes = require('./auth.routes');
const wordRoutes = require('./word.routes');
const categoryRoutes = require('./category.routes');
const gameRoutes = require('./game.routes');
const userRoutes = require('./user.routes');
const aiRoutes = require('./ai.routes');
const adminRoutes = require('./admin.routes');

// Route'ları kullanma
router.use('/auth', authRoutes);
router.use('/words', wordRoutes);
router.use('/categories', categoryRoutes);
router.use('/games', gameRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

// Sağlık kontrolü endpoint'i
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API çalışıyor',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
router.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'İstenen endpoint bulunamadı'
    });
});

module.exports = router; 