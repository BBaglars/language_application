// DİKKAT: Bu random çekme yöntemi, önce uygun ID'leri çekip JS ile random seçip sonra asıl verileri çekiyor.
// Avantaj: Büyük veri setlerinde ORDER BY RANDOM()'dan çok daha hızlı ve veritabanı dostu.
// Negatif: Eğer veri seti milyonlarca satıra ulaşırsa, ID'leri çekmek bile yavaşlayabilir. O zaman cache veya materialized view gibi teknikler gerekebilir.

const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  const { languagePairId, categoryId, difficultyLevel, limit = 8 } = req.query;
  const pairId = parseInt(languagePairId);
  const catId = categoryId === 'all' ? undefined : parseInt(categoryId);

  try {
    // 1. Uygun ID'leri çek
    const where = {
      languagePairId: pairId,
      difficultyLevel: difficultyLevel
    };
    if (catId) {
      where.sourceWord = { categoryId: catId };
    }

    const ids = await prisma.translation.findMany({
      where,
      select: { id: true }
    });

    // 2. Rastgele limit kadar ID seç
    function getRandomSample(arr, n) {
      const result = [];
      const taken = new Set();
      while (result.length < n && result.length < arr.length) {
        const idx = Math.floor(Math.random() * arr.length);
        if (!taken.has(idx)) {
          result.push(arr[idx].id);
          taken.add(idx);
        }
      }
      return result;
    }
    const randomIds = getRandomSample(ids, Number(limit));

    // 3. Bu ID'lerle asıl verileri çek
    const translations = await prisma.translation.findMany({
      where: { id: { in: randomIds } },
      include: {
        sourceWord: true,
        targetWord: true
      }
    });

    const pairs = translations.map((t, idx) => ({
      pairId: t.id,
      word: { id: t.sourceWord.id, text: t.sourceWord.text },
      meaning: { id: t.targetWord?.id || null, text: t.targetWord?.text || t.targetText }
    }));

    res.json({ data: { pairs } });
  } catch (e) {
    console.error('Matching game error:', e);
    res.status(500).json({ error: 'Beklenmeyen bir hata oluştu.' });
  }
});

module.exports = router; 