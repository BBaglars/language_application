const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');
const UserWordProgressService = require('../services/userWordProgress.service.js');
const { validateUserWordProgress } = require('../middleware/validation.js');

const prisma = new PrismaClient();

class UserWordProgressController {
  // Tüm kelime ilerlemelerini getir
  static async getAllUserWordProgresses(req, res, next) {
    try {
      const progress = await prisma.userWordProgress.findMany({
        include: {
          user: true,
          word: true
        }
      });
      res.json(progress);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // ID'ye göre kelime ilerlemesi getir
  static async getUserWordProgressById(req, res, next) {
    try {
      const progress = await prisma.userWordProgress.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          user: true,
          word: true
        }
      });

      if (!progress) {
        return next(new AppError('Kelime ilerlemesi bulunamadı', 404));
      }

      res.json(progress);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Yeni kelime ilerlemesi oluştur
  static async createUserWordProgress(req, res, next) {
    try {
      const { wordId, proficiencyLevel, reviewCount, lastReviewedAt } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('Kullanıcı kimliği bulunamadı', 401));
      }
      const newProgress = await prisma.userWordProgress.create({
        data: {
          userId: parseInt(userId),
          wordId: parseInt(wordId),
          proficiencyLevel,
          reviewCount: reviewCount || 0,
          lastReviewedAt: lastReviewedAt ? new Date(lastReviewedAt) : new Date()
        },
        include: {
          user: true,
          word: true
        }
      });
      res.status(201).json(newProgress);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kelime ilerlemesi güncelle
  static async updateUserWordProgress(req, res, next) {
    try {
      const { proficiencyLevel, reviewCount, lastReviewedAt } = req.body;
      const id = parseInt(req.params.id);
      const updatedProgress = await prisma.userWordProgress.update({
        where: { id },
        data: {
          proficiencyLevel: proficiencyLevel || undefined,
          reviewCount: reviewCount || undefined,
          lastReviewedAt: lastReviewedAt ? new Date(lastReviewedAt) : undefined
        },
        include: {
          user: true,
          word: true
        }
      });
      res.json(updatedProgress);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Kayıt bulunamadı' });
      }
      next(new AppError(error.message, 500));
    }
  }

  // Kelime ilerlemesi sil
  static async deleteUserWordProgress(req, res, next) {
    try {
      await prisma.userWordProgress.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(204).send();
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Dil bazlı ilerleme getir
  static async getLanguageProgress(req, res, next) {
    try {
      const userId = req.user?.id;
      const { languageId } = req.params;
      if (!userId) {
        return next(new AppError('Kullanıcı kimliği bulunamadı', 401));
      }
      const progress = await prisma.userWordProgress.findMany({
        where: {
          userId: parseInt(userId),
          word: {
            languageId: parseInt(languageId)
          }
        },
        include: {
          word: true
        }
      });
      res.json(progress);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kategori bazlı ilerleme getir
  static async getCategoryProgress(req, res, next) {
    try {
      const userId = req.user?.id;
      const { categoryId } = req.params;
      if (!userId) {
        return next(new AppError('Kullanıcı kimliği bulunamadı', 401));
      }
      const progress = await prisma.userWordProgress.findMany({
        where: {
          userId: parseInt(userId),
          word: {
            categories: {
              some: {
                categoryId: parseInt(categoryId)
              }
            }
          }
        },
        include: {
          word: true
        }
      });
      res.json(progress);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = UserWordProgressController;