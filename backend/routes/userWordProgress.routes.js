const express = require('express');
const router = express.Router();
const UserWordProgressController = require('../controllers/userWordProgressController.js');
const { authenticate } = require('../middleware/auth.middleware.js');

// Tüm kelime ilerlemelerini getir
router.get('/', authenticate, UserWordProgressController.getAllUserWordProgresses);
// ID'ye göre kelime ilerlemesi getir
router.get('/:id', authenticate, UserWordProgressController.getUserWordProgressById);
// Yeni kelime ilerlemesi oluştur
router.post('/', authenticate, UserWordProgressController.createUserWordProgress);
// Kelime ilerlemesi güncelle
router.patch('/:id', authenticate, UserWordProgressController.updateUserWordProgress);
// Kelime ilerlemesi sil
router.delete('/:id', authenticate, UserWordProgressController.deleteUserWordProgress);
// Dil bazlı ilerleme getir
router.get('/language/:languageId', authenticate, UserWordProgressController.getLanguageProgress);
// Kategori bazlı ilerleme getir
router.get('/category/:categoryId', authenticate, UserWordProgressController.getCategoryProgress);

module.exports = router; 