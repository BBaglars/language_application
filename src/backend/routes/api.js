const express = require('express');
const router = express.Router();

// Kullanıcı rotaları
router.use('/users', require('./users'));

// Kelime rotaları
router.use('/words', require('./words'));

// Kategori rotaları
router.use('/categories', require('./categories'));

module.exports = router; 