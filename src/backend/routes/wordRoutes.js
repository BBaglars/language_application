const express = require('express');
const router = express.Router();
const WordController = require('../controllers/wordController');

// Tüm kelimeleri getir ve ana route
router.get('/', WordController.getWords);

// Yeni kelime ekle
router.post('/', WordController.createWord);

// Kelime detayını getir
router.get('/:id', WordController.getWordById);

// Kelime güncelle
router.put('/:id', WordController.updateWord);

// Kelime sil
router.delete('/:id', WordController.deleteWord);

// Kelimenin kategorilerini getir
router.get('/:id/categories', WordController.getWordCategories);

// Kelimeye kategori ekle
router.post('/:id/categories/:categoryId', WordController.addWordToCategory);

// Kelimeden kategori kaldır
router.delete('/:id/categories/:categoryId', WordController.removeWordFromCategory);

// Kelimenin çevirilerini getir
router.get('/:id/translations', WordController.getWordTranslations);

// Kelimeye çeviri ekle
router.post('/:id/translations', WordController.addTranslation);

// Kelimeden çeviri kaldır
router.delete('/:id/translations/:translationId', WordController.removeTranslation);

module.exports = router; 