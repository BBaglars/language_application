const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class UserWordProgressService {
  async createUserWordProgress(data) {
    const { userId, wordId, proficiencyLevel, reviewCount, lastReviewedAt } = data;
    return await prisma.userWordProgress.create({
      data: {
        userId,
        wordId,
        proficiencyLevel,
        reviewCount: reviewCount || 0,
        lastReviewedAt: lastReviewedAt ? new Date(lastReviewedAt) : new Date()
      },
      include: {
        user: true,
        word: true
      }
    });
  }

  async getUserWordProgresses(filters = {}) {
    const { userId, wordId } = filters;
    const where = {};
    if (userId) where.userId = userId;
    if (wordId) where.wordId = wordId;
    return await prisma.userWordProgress.findMany({
      where,
      include: {
        user: true,
        word: true
      }
    });
  }

  async getUserWordProgressById(id) {
    const userWordProgress = await prisma.userWordProgress.findUnique({
      where: { id },
      include: {
        user: true,
        word: true
      }
    });
    if (!userWordProgress) {
      throw new NotFoundError('Kelime ilerlemesi bulunamadı');
    }
    return userWordProgress;
  }

  async getUserWordProgressesByUser(userId) {
    return prisma.userWordProgress.findMany({
      where: { userId },
      include: {
        user: true,
        word: true
      }
    });
  }

  async getUserWordProgressesByWord(wordId, userId) {
    return prisma.userWordProgress.findMany({
      where: {
        wordId,
        userId
      },
      include: {
        user: true,
        word: true
      }
    });
  }

  async getUserWordProgressesByProficiencyLevel(proficiencyLevel, userId) {
    return prisma.userWordProgress.findMany({
      where: {
        proficiencyLevel,
        userId
      },
      include: {
        user: true,
        word: true
      }
    });
  }

  async updateUserWordProgress(id, data) {
    const { proficiencyLevel, reviewCount, lastReviewedAt } = data;
    return await prisma.userWordProgress.update({
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
  }

  async deleteUserWordProgress(id) {
    return await prisma.userWordProgress.delete({
      where: { id }
    });
  }
}

module.exports = UserWordProgressService; 