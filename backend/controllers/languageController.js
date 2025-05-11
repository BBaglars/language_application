const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class LanguageController {
  // Tüm dilleri getir
  static async getAllLanguages(req, res, next) {
    try {
      const languages = await prisma.language.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      res.json({
        status: 'success',
        data: {
          languages
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Tek bir dili getir
  static async getLanguage(req, res, next) {
    try {
      const languageId = parseInt(req.params.id);

      const language = await prisma.language.findUnique({
        where: { id: languageId }
      });

      if (!language) {
        return next(new AppError('Dil bulunamadı', 404));
      }

      res.json({
        status: 'success',
        data: {
          language
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Yeni dil ekle
  static async createLanguage(req, res, next) {
    try {
      const { name, code } = req.body;

      // Dil kodu kontrolü
      const existingLanguage = await prisma.language.findFirst({
        where: {
          OR: [
            { name },
            { code }
          ]
        }
      });

      if (existingLanguage) {
        return next(new AppError('Bu dil adı veya kodu zaten kullanılıyor', 400));
      }

      const language = await prisma.language.create({
        data: {
          name,
          code
        }
      });

      res.status(201).json({
        status: 'success',
        data: {
          language
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Dil güncelle
  static async updateLanguage(req, res, next) {
    try {
      const languageId = parseInt(req.params.id);
      const { name, code } = req.body;

      // Dil kontrolü
      const language = await prisma.language.findUnique({
        where: { id: languageId }
      });

      if (!language) {
        return next(new AppError('Dil bulunamadı', 404));
      }

      // Dil adı veya kodu değişiyorsa kontrol et
      if (name !== language.name || code !== language.code) {
        const existingLanguage = await prisma.language.findFirst({
          where: {
            OR: [
              { name },
              { code }
            ],
            NOT: {
              id: languageId
            }
          }
        });

        if (existingLanguage) {
          return next(new AppError('Bu dil adı veya kodu zaten kullanılıyor', 400));
        }
      }

      const updatedLanguage = await prisma.language.update({
        where: { id: languageId },
        data: {
          name,
          code
        }
      });

      res.json({
        status: 'success',
        data: {
          language: updatedLanguage
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Dil sil
  static async deleteLanguage(req, res, next) {
    try {
      const languageId = parseInt(req.params.id);

      // Dil kontrolü
      const language = await prisma.language.findUnique({
        where: { id: languageId }
      });

      if (!language) {
        return next(new AppError('Dil bulunamadı', 404));
      }

      // İlişkili kayıtları kontrol et
      const hasRelatedRecords = await prisma.$transaction(async (prisma) => {
        const wordCount = await prisma.word.count({
          where: { languageId }
        });

        const sourcePairCount = await prisma.languagePair.count({
          where: { sourceLanguageId: languageId }
        });

        const targetPairCount = await prisma.languagePair.count({
          where: { targetLanguageId: languageId }
        });

        const storyCount = await prisma.story.count({
          where: { languageId }
        });

        return wordCount > 0 || sourcePairCount > 0 || targetPairCount > 0 || storyCount > 0;
      });

      if (hasRelatedRecords) {
        return next(new AppError('Bu dil ile ilişkili kayıtlar olduğu için silinemez', 400));
      }

      await prisma.language.delete({
        where: { id: languageId }
      });

      res.status(200).json({ message: 'Dil başarıyla silindi' });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Dildeki kelimeleri getir
  static async getLanguageWords(req, res, next) {
    try {
      const languageId = parseInt(req.params.id);

      const language = await prisma.language.findUnique({
        where: { id: languageId },
        include: {
          words: {
            include: {
              categories: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      if (!language) {
        return next(new AppError('Dil bulunamadı', 404));
      }

      res.json(language.words);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Dil çiftlerini getir
  static async getLanguagePairs(req, res, next) {
    try {
      const languageId = parseInt(req.params.id);

      const language = await prisma.language.findUnique({
        where: { id: languageId },
        include: {
          sourceLanguagePairs: {
            include: {
              targetLanguage: true
            }
          },
          targetLanguagePairs: {
            include: {
              sourceLanguage: true
            }
          }
        }
      });

      if (!language) {
        return next(new AppError('Dil bulunamadı', 404));
      }

      // Tüm dil çiftlerini birleştir
      const pairs = [
        ...language.sourceLanguagePairs.map(pair => ({
          id: pair.id,
          sourceLanguage: language,
          targetLanguage: pair.targetLanguage
        })),
        ...language.targetLanguagePairs.map(pair => ({
          id: pair.id,
          sourceLanguage: pair.sourceLanguage,
          targetLanguage: language
        }))
      ];

      res.json(pairs);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = LanguageController; 