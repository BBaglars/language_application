const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class TranslationService {
  constructor() {
    this.prisma = prisma;
  }

  async createTranslation(data) {
    const { sourceWordId, targetWordId, targetText, languagePairId, difficultyLevel } = data;

    if (!sourceWordId || !languagePairId || !difficultyLevel) {
      throw new ValidationError('Zorunlu alanlar eksik');
    }
    if (!targetWordId && !targetText) {
      throw new ValidationError('Hedef kelime veya anlam (text) zorunlu');
    }

    // languagePairId ve difficultyLevel parse
    const languagePairIdInt = parseInt(languagePairId);
    const sourceWordIdInt = parseInt(sourceWordId);
    const targetWordIdInt = targetWordId ? parseInt(targetWordId) : undefined;

    // Aynı çeviri var mı kontrolü (id veya text ile)
    const existing = await this.prisma.translation.findFirst({
      where: {
        sourceWordId: sourceWordIdInt,
        languagePairId: languagePairIdInt,
        ...(targetWordIdInt ? { targetWordId: targetWordIdInt } : {}),
        ...(targetText ? { targetText } : {})
      }
    });
    if (existing) {
      throw new ValidationError('Bu çeviri zaten mevcut');
    }

    return await this.prisma.translation.create({
      data: {
        sourceWordId: sourceWordIdInt,
        targetWordId: targetWordIdInt,
        targetText: targetText || null,
        languagePairId: languagePairIdInt,
        difficultyLevel
      },
      include: {
        sourceWord: true,
        targetWord: true,
        languagePair: true
      }
    });
  }

  async getTranslations(filters = {}, pagination = {}) {
    const { languagePairId } = filters;
    const { page = 1, limit = 10 } = pagination;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;

    const where = {
      ...(languagePairId && { languagePairId: parseInt(languagePairId) })
    };

    const [translations, total] = await Promise.all([
      this.prisma.translation.findMany({
        where,
        skip,
        take: limitInt,
        include: {
          languagePair: true,
          sourceWord: true,
          targetWord: true
        },
        orderBy: {
          id: 'desc'
        }
      }),
      this.prisma.translation.count({ where })
    ]);

    return {
      data: translations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getTranslationById(id) {
    const translation = await this.prisma.translation.findUnique({
      where: { id: parseInt(id) },
      include: {
        languagePair: true
      }
    });

    if (!translation) {
      throw new NotFoundError('Çeviri bulunamadı');
    }

    return translation;
  }

  async updateTranslation(id, data) {
    const { sourceText, targetText } = data;

    const existingTranslation = await this.prisma.translation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTranslation) {
      throw new NotFoundError('Çeviri bulunamadı');
    }

    return await this.prisma.translation.update({
      where: { id: parseInt(id) },
      data: {
        sourceText: sourceText || undefined,
        targetText: targetText || undefined
      },
      include: {
        languagePair: true
      }
    });
  }

  async deleteTranslation(id) {
    const translation = await this.prisma.translation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!translation) {
      throw new NotFoundError('Çeviri bulunamadı');
    }

    return await this.prisma.translation.delete({
      where: { id: parseInt(id) }
    });
  }

  async getTranslationsByLanguagePair(languagePairId) {
    const translations = await this.prisma.translation.findMany({
      where: {
        languagePairId: parseInt(languagePairId)
      },
      include: {
        languagePair: true
      },
      orderBy: {
        sourceText: 'asc'
      }
    });

    if (!translations.length) {
      throw new NotFoundError('Bu dil çiftine ait çeviri bulunamadı');
    }

    return translations;
  }
}

module.exports = TranslationService;