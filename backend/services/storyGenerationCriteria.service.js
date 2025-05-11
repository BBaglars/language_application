const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class StoryGenerationCriteriaService {
  async createCriteria(data) {
    try {
      const criteria = await prisma.storyGenerationCriteria.create({
        data: {
          languagePairId: data.languagePairId,
          minWordCount: data.minWordCount || null,
          maxWordCount: data.maxWordCount || null,
          targetDifficultyLevel: data.targetDifficultyLevel,
          theme: data.theme || null,
          style: data.style || null
        }
      });
      return criteria;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ValidationError('Bu kriter zaten mevcut');
      }
      throw error;
    }
  }

  async getCriteriaById(id) {
    const criteria = await prisma.storyGenerationCriteria.findUnique({
      where: { id },
      include: {
        languagePair: {
          include: {
            sourceLanguage: true,
            targetLanguage: true
          }
        },
        stories: true
      }
    });

    if (!criteria) {
      throw new NotFoundError('Kriter bulunamadı');
    }

    return criteria;
  }

  async getAllCriteria() {
    return prisma.storyGenerationCriteria.findMany({
      include: {
        languagePair: {
          include: {
            sourceLanguage: true,
            targetLanguage: true
          }
        },
        stories: true
      },
      orderBy: { id: 'asc' }
    });
  }

  async updateCriteria(id, data) {
    const criteria = await this.getCriteriaById(id);

    return prisma.storyGenerationCriteria.update({
      where: { id },
      data: {
        languagePairId: data.languagePairId,
        minWordCount: data.minWordCount || null,
        maxWordCount: data.maxWordCount || null,
        targetDifficultyLevel: data.targetDifficultyLevel,
        theme: data.theme || null,
        style: data.style || null
      }
    });
  }

  async deleteCriteria(id) {
    const criteria = await this.getCriteriaById(id);

    if (criteria.stories && criteria.stories.length > 0) {
      throw new ValidationError('Bu kritere ait hikayeler var. Önce hikayeleri silmelisiniz.');
    }

    await prisma.storyGenerationCriteria.delete({
      where: { id }
    });
  }
}

module.exports = StoryGenerationCriteriaService;