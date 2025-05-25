const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Kelime bulmaca oyunu için kelimeleri getir
router.get('/', async (req, res) => {
  try {
    const { categoryId, difficultyLevel, languageId, limit = 10 } = req.query;

    // Zorluk seviyesine göre kelime uzunluğu aralığını belirle
    let minLength, maxLength;
    switch (difficultyLevel) {
      case 'A1':
        minLength = 3;
        maxLength = 6;
        break;
      case 'A2':
        minLength = 4;
        maxLength = 7;
        break;
      case 'B1':
      case 'B2':
        minLength = 6;
        maxLength = 10;
        break;
      default:
        minLength = 3;
        maxLength = 7;
    }

    // Önce toplam kelime sayısını al
    const totalWords = await prisma.word.count({
      where: {
        letterCount: {
          gte: minLength,
          lte: maxLength
        },
        languageId: parseInt(languageId),
        ...(categoryId && categoryId !== 'all' ? {
          categories: {
            some: {
              categoryId: parseInt(categoryId)
            }
          }
        } : {}),
        difficultyLevel: difficultyLevel
      }
    });

    // Rastgele bir başlangıç noktası seç
    const skip = Math.floor(Math.random() * Math.max(0, totalWords - parseInt(limit)));

    // Kelimeleri getir
    const words = await prisma.word.findMany({
      where: {
        letterCount: {
          gte: minLength,
          lte: maxLength
        },
        languageId: parseInt(languageId),
        ...(categoryId && categoryId !== 'all' ? {
          categories: {
            some: {
              categoryId: parseInt(categoryId)
            }
          }
        } : {}),
        difficultyLevel: difficultyLevel
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        language: true
      },
      take: parseInt(limit),
      skip: skip,
      orderBy: {
        id: 'asc'
      }
    });

    // Yanıtı formatla
    const formattedWords = words.map(word => ({
      id: word.id,
      text: word.text,
      meaning: word.meaning,
      length: word.letterCount,
      category: word.categories[0]?.category.name || 'Genel',
      difficulty: word.difficultyLevel,
      language: word.language.name
    }));

    res.json({
      success: true,
      data: {
        words: formattedWords,
        settings: {
          minLength,
          maxLength,
          totalWords: formattedWords.length
        }
      }
    });

  } catch (error) {
    console.error('Kelime bulmaca kelimeleri getirilirken hata:', error);
    res.status(500).json({
      success: false,
      error: 'Kelimeler getirilirken bir hata oluştu'
    });
  }
});

module.exports = router;