const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class GameResultController {
  // Tüm oyun sonuçlarını getir
  static async getAllGameResults(req, res, next) {
    try {
      const results = await prisma.gameResult.findMany({
        include: {
          user: true,
          language: true
        }
      });
      res.json(results);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // ID'ye göre oyun sonucu getir
  static async getGameResultById(req, res, next) {
    try {
      const result = await prisma.gameResult.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          user: true,
          language: true
        }
      });

      if (!result) {
        return next(new AppError('Oyun sonucu bulunamadı', 404));
      }

      res.json(result);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Yeni oyun sonucu oluştur
  static async createGameResult(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('Kullanıcı kimliği bulunamadı', 401));
      }
      const { languageId, gameType, score, duration } = req.body;
      const result = await prisma.gameResult.create({
        data: {
          userId: parseInt(userId),
          languageId: parseInt(languageId),
          gameType,
          score: parseInt(score),
          duration: parseInt(duration)
        },
        include: {
          user: true,
          language: true
        }
      });
      res.status(201).json(result);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Oyun sonucu güncelle
  static async updateGameResult(req, res, next) {
    try {
      const { score, duration } = req.body;
      const id = parseInt(req.params.id);
      const result = await prisma.gameResult.update({
        where: { id },
        data: {
          score: score !== undefined ? parseInt(score) : undefined,
          duration: duration !== undefined ? parseInt(duration) : undefined
        },
        include: {
          user: true,
          language: true
        }
      });
      res.json(result);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Oyun sonucu sil
  static async deleteGameResult(req, res, next) {
    try {
      await prisma.gameResult.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(204).send();
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kullanıcının tüm sonuçlarını getir
  static async getUserResults(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('Kullanıcı kimliği bulunamadı', 401));
      }
      const results = await prisma.gameResult.findMany({
        where: { userId: parseInt(userId) },
        include: {
          language: true
        }
      });
      res.json(results);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kullanıcının dil bazlı sonuçlarını getir
  static async getUserLanguageResults(req, res, next) {
    try {
      const userId = req.user?.id;
      const { languageId } = req.params;
      if (!userId) {
        return next(new AppError('Kullanıcı kimliği bulunamadı', 401));
      }
      const results = await prisma.gameResult.findMany({
        where: {
          userId: parseInt(userId),
          languageId: parseInt(languageId)
        },
        include: {
          language: true
        }
      });
      res.json(results);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kullanıcının istatistiklerini getir
  static async getUserStats(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('Kullanıcı kimliği bulunamadı', 401));
      }
      const stats = await prisma.gameResult.groupBy({
        by: ['gameType'],
        where: { userId: parseInt(userId) },
        _avg: {
          score: true,
          duration: true
        },
        _count: true
      });
      res.json(stats);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = GameResultController;