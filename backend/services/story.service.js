const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class StoryService {
  async createStory(data) {
    const { title, content, difficultyLevel, languageId, userId } = data;
    return await prisma.story.create({
      data: {
        title,
        content,
        difficultyLevel,
        languageId,
        userId
      },
      include: {
        language: true,
        user: true,
        generationJobs: true,
        words: true
      }
    });
  }

  async getStories(filters = {}) {
    const { languageId, userId } = filters;
    const where = {};
    if (languageId) where.languageId = languageId;
    if (userId) where.userId = userId;
    return await prisma.story.findMany({
      where,
      include: {
        language: true,
        user: true,
        generationJobs: true,
        words: true
      }
    });
  }

  async getStoryById(id) {
    return await prisma.story.findUnique({
      where: { id },
      include: {
        language: true,
        user: true,
        generationJobs: true,
        words: true
      }
    });
  }

  async updateStory(id, data) {
    const { title, content, difficultyLevel, languageId, userId } = data;
    return await prisma.story.update({
      where: { id },
      data: {
        title: title || undefined,
        content: content || undefined,
        difficultyLevel: difficultyLevel || undefined,
        languageId: languageId || undefined,
        userId: userId || undefined
      },
      include: {
        language: true,
        user: true,
        generationJobs: true,
        words: true
      }
    });
  }

  async deleteStory(id) {
    return await prisma.story.delete({
      where: { id }
    });
  }

  async getStoriesByUser(userId, filters = {}) {
    const { languageId, difficultyLevel, search } = filters;

    const where = {
      userId,
      ...(languageId && { languageId }),
      ...(difficultyLevel && { difficultyLevel }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    return prisma.story.findMany({
      where,
      include: {
        language: true,
        _count: {
          select: { generationJobs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getStoriesByDifficultyLevel(difficultyLevel, userId) {
    return prisma.story.findMany({
      where: {
        difficultyLevel,
        userId
      },
      include: {
        language: true,
        words: {
          include: {
            word: true
          }
        }
      }
    });
  }

  async getStoriesByLanguage(languageId, userId) {
    return prisma.story.findMany({
      where: {
        languageId,
        userId
      },
      include: {
        language: true,
        words: {
          include: {
            word: true
          }
        }
      }
    });
  }

  async getStoryWithGenerationJobs(id, userId) {
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        language: true,
        words: {
          include: {
            word: true
          }
        },
        generationJobs: {
          include: {
            criteria: true
          }
        }
      }
    });

    if (!story) {
      throw new NotFoundError('Hikaye bulunamadı');
    }

    if (story.userId !== userId) {
      throw new ValidationError('Bu hikayeye erişim izniniz yok');
    }

    return story;
  }

  async addWordToStory(storyId, wordId) {
    try {
      // Önce mevcut en yüksek sıra numarasını bul
      const maxOrder = await prisma.storyWord.findFirst({
        where: { storyId },
        orderBy: { order: 'desc' },
        select: { order: true }
      });

      const storyWord = await prisma.storyWord.create({
        data: {
          story: {
            connect: { id: storyId }
          },
          word: {
            connect: { id: wordId }
          },
          order: (maxOrder?.order ?? -1) + 1
        },
        include: {
          word: true
        }
      });

      return storyWord;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ValidationError('Bu kelime zaten hikayeye eklenmiş');
      }
      throw error;
    }
  }

  async removeWordFromStory(storyId, wordId) {
    try {
      await prisma.storyWord.delete({
        where: {
          storyId_wordId: {
            storyId,
            wordId
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Kelime-hikaye ilişkisi bulunamadı');
      }
      throw error;
    }
  }
}

module.exports = StoryService;