const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');
const logger = require('../utils/logger.js');

const prisma = new PrismaClient();

class WordService {
  constructor() {
    this.prisma = prisma;
  }

  async createWord(data) {
    const { text, meaning, example, difficultyLevel, languageId, letterCount } = data;

    const language = await this.prisma.language.findUnique({
      where: { id: languageId }
    });

    if (!language) {
      throw new NotFoundError('Dil bulunamadı');
    }

    const word = await this.prisma.word.create({
      data: {
        text,
        meaning,
        example,
        difficultyLevel,
        languageId,
        letterCount
      },
      include: {
        categories: true
      }
    });
    logger.info(`Kelime oluşturuldu: ${word.id} - ${word.text}`);
    return word;
  }

  async getWords(filters = {}, pagination = {}) {
    const { search, languageId, categoryId } = filters;
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { text: { contains: search, mode: 'insensitive' } },
          { meaning: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(languageId && { languageId }),
      ...(categoryId && {
        categories: {
          some: { categoryId }
        }
      })
    };

    const [words, total] = await Promise.all([
      this.prisma.word.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: true
        }
      }),
      this.prisma.word.count({ where })
    ]);

    return {
      data: words,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getWordById(id) {
    return await this.prisma.word.findUnique({
      where: { id },
      include: {
        categories: true
      }
    });
  }

  async updateWord(id, data) {
    id = parseInt(id);
    const { text, meaning, example, difficultyLevel, languageId } = data;

    const existingWord = await this.prisma.word.findUnique({
      where: { id }
    });

    if (!existingWord) {
      return null;
    }

    if (languageId) {
      const language = await this.prisma.language.findUnique({
        where: { id: languageId }
      });

      if (!language) {
        throw new NotFoundError('Dil bulunamadı');
      }
    }

    const letterCount = text ? text.length : existingWord.text.length;

    const word = await this.prisma.word.update({
      where: { id },
      data: {
        text: text !== undefined ? text : existingWord.text,
        meaning: meaning !== undefined ? meaning : existingWord.meaning,
        example: example !== undefined ? example : existingWord.example,
        difficultyLevel: difficultyLevel !== undefined ? difficultyLevel : existingWord.difficultyLevel,
        languageId: languageId !== undefined ? languageId : existingWord.languageId,
        letterCount
      },
      include: {
        categories: true
      }
    });
    logger.info(`Kelime güncellendi: ${word.id} - ${word.text}`);
    return word;
  }

  async deleteWord(id) {
    id = parseInt(id);
    const word = await this.prisma.word.findUnique({
      where: { id }
    });

    if (!word) {
      return null;
    }

    await Promise.all([
      this.prisma.wordCategory.deleteMany({
        where: { wordId: id }
      }),
      this.prisma.userWordProgress.deleteMany({
        where: { wordId: id }
      }),
      this.prisma.storyWord.deleteMany({
        where: { wordId: id }
      })
    ]);

    const deletedWord = await this.prisma.word.delete({
      where: { id }
    });
    logger.info(`Kelime silindi: ${deletedWord.id} - ${deletedWord.text}`);
    return deletedWord;
  }

  async getWordsByDifficultyLevel(difficultyLevel) {
    return this.prisma.word.findMany({
      where: { difficultyLevel },
      include: {
        language: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  }

  async getWordsByCategory(categoryId) {
    return this.prisma.word.findMany({
      where: {
        categories: {
          some: { categoryId }
        }
      },
      include: {
        language: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  }

  async getWordsByLanguage(languageId) {
    return this.prisma.word.findMany({
      where: { languageId },
      include: {
        language: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  }
}

module.exports = WordService;