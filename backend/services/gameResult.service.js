const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class GameResultService {
  async createGameResult(data) {
    const { userId, languageId, categoryId, gameType, score, correctAnswers, wrongAnswers, timeSpent, difficultyLevel, playedAt } = data;
    return await prisma.gameResult.create({
      data: {
        userId,
        languageId,
        categoryId,
        gameType,
        score,
        correctAnswers,
        wrongAnswers,
        timeSpent,
        difficultyLevel,
        playedAt: playedAt ? new Date(playedAt) : undefined
      },
      include: {
        user: true
      }
    });
  }

  async getGameResults(filters = {}) {
    const { userId, languageId, categoryId } = filters;
    const where = {};
    if (userId) where.userId = userId;
    if (languageId) where.languageId = languageId;
    if (categoryId) where.categoryId = categoryId;
    return await prisma.gameResult.findMany({
      where,
      include: {
        user: true
      }
    });
  }

  async getGameResultById(id) {
    const gameResult = await prisma.gameResult.findUnique({
      where: { id },
      include: {
        user: true
      }
    });
    if (!gameResult) {
      throw new NotFoundError('Oyun sonucu bulunamadı');
    }
    return gameResult;
  }

  async getGameResultsByUser(userId) {
    return prisma.gameResult.findMany({
      where: { userId },
      include: {
        language: true,
        category: true
      }
    });
  }

  async getGameResultsByLanguage(languageId, userId) {
    return prisma.gameResult.findMany({
      where: {
        languageId,
        userId
      },
      include: {
        language: true,
        category: true
      }
    });
  }

  async getGameResultsByCategory(categoryId, userId) {
    return prisma.gameResult.findMany({
      where: {
        categoryId,
        userId
      },
      include: {
        language: true,
        category: true
      }
    });
  }

  async getGameResultsByGameType(gameType, userId) {
    return prisma.gameResult.findMany({
      where: {
        gameType,
        userId
      },
      include: {
        language: true,
        category: true
      }
    });
  }

  async getGameResultsByDifficultyLevel(difficultyLevel, userId) {
    return prisma.gameResult.findMany({
      where: {
        difficultyLevel,
        userId
      },
      include: {
        language: true,
        category: true
      }
    });
  }

  async updateGameResult(id, data) {
    const { languageId, categoryId, gameType, score, correctAnswers, wrongAnswers, timeSpent, difficultyLevel, playedAt } = data;
    return await prisma.gameResult.update({
      where: { id },
      data: {
        languageId: languageId || undefined,
        categoryId: categoryId || undefined,
        gameType: gameType || undefined,
        score: score || undefined,
        correctAnswers: correctAnswers || undefined,
        wrongAnswers: wrongAnswers || undefined,
        timeSpent: timeSpent || undefined,
        difficultyLevel: difficultyLevel || undefined,
        playedAt: playedAt ? new Date(playedAt) : undefined
      },
      include: {
        user: true
      }
    });
  }

  async deleteGameResult(id) {
    return await prisma.gameResult.delete({
      where: { id }
    });
  }
}

module.exports = GameResultService; 