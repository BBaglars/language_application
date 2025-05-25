const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate } = require('../middleware/auth.middleware.js');

// Çoklu dil çifti ve seviye desteğiyle kelime getir
router.get('/scramble-word', authenticate, async (req, res) => {
  try {
    const { languagePairId, categoryId, difficultyLevel } = req.query;

    if (!languagePairId || languagePairId === '' || !difficultyLevel) {
      return res.status(400).json({ status: 'error', message: 'Dil çifti seçilmedi!' });
    }

    // Sorgu filtresi
    const where = {
      languagePairId: Number(languagePairId),
      difficultyLevel: difficultyLevel,
      targetWord: { is: {} }
    };
    if (categoryId && categoryId !== 'all') {
      where.sourceWord = {
        categories: {
          some: { categoryId: Number(categoryId) }
        }
      };
    }

    const translations = await prisma.translation.findMany({
      where,
      include: {
        sourceWord: true,
        targetWord: true
      }
    });

    // En az 5 harfli sourceWord'leri filtrele
    const filteredTranslations = translations.filter(t => t.sourceWord.text && t.sourceWord.text.length >= 5);
    if (!filteredTranslations.length) {
      return res.status(404).json({ status: 'error', message: 'En az 5 harfli uygun kelime bulunamadı!' });
    }

    // Rastgele bir çeviri seç
    const randomTranslation = filteredTranslations[Math.floor(Math.random() * filteredTranslations.length)];
    res.json({
      status: 'success',
      data: {
        word: randomTranslation.sourceWord.text,
        meaning: randomTranslation.targetWord.text,
        sourceWordId: randomTranslation.sourceWord.id,
        targetWordId: randomTranslation.targetWord.id,
        difficultyLevel: randomTranslation.difficultyLevel,
        wordLang: randomTranslation.sourceWord.languageId,
        meaningLang: randomTranslation.targetWord.languageId
      }
    });
  } catch (error) {
    console.error('Çoklu dil scramble kelime hatası:', error);
    res.status(500).json({ status: 'error', message: 'Sunucu hatası!' });
  }
});

module.exports = router; 