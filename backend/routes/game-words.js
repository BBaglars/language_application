const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/game-words?lang=4454&cat=all&level=A1
router.get('/', async (req, res) => {
  try {
    const { lang, cat, level } = req.query;
    if (!lang || !level) {
      return res.status(400).json({ message: 'Dil ve seviye zorunludur.' });
    }
    const where = {
      languageId: Number(lang),
      difficultyLevel: level
    };
    if (cat && cat !== 'all') {
      where.categories = { some: { categoryId: Number(cat) } };
    }
    // Uygun kelimeleri bul
    const words = await prisma.word.findMany({
      where,
      include: { categories: true }
    });
    // Sadece 5 harfli kelimeleri filtrele
    const fiveLetterWords = words.filter(w => w.text.length === 5);
    if (!fiveLetterWords.length) {
      return res.status(404).json({ message: '5 harfli uygun kelime bulunamadı.' });
    }
    // Rastgele bir kelime seç
    const randomWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)];
    res.json({ word: randomWord.text });
  } catch (error) {
    console.error('Game word fetch error:', error);
    res.status(500).json({ message: 'Kelime getirilirken hata oluştu.' });
  }
});

module.exports = router; 