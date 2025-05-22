const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// İstatistikleri getir
router.get('/', async (req, res) => {
  try {
    const [
      totalWords,
      totalCategories,
      totalLanguages,
      totalUsers,
      totalTranslations,
      totalStories
    ] = await Promise.all([
      prisma.word.count(),
      prisma.category.count(),
      prisma.language.count(),
      prisma.user.count(),
      prisma.translation.count(),
      prisma.story.count()
    ]);

    // Son 7 günün kelime ekleme istatistikleri
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const wordsByDate = await prisma.word.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: lastWeek
        }
      },
      _count: true
    });

    res.json({
      success: true,
      data: {
        totalWords,
        totalCategories,
        totalLanguages,
        totalUsers,
        totalTranslations,
        totalStories,
        wordsByDate: wordsByDate.map(item => ({
          date: item.createdAt,
          count: item._count
        }))
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler alınırken bir hata oluştu'
    });
  }
});

module.exports = router; 