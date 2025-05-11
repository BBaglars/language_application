const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class LanguagePairService {
  async createLanguagePair(data) {
    const { sourceLanguageId, targetLanguageId } = data;
    return await prisma.languagePair.create({
      data: {
        sourceLanguageId,
        targetLanguageId
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
        translations: true
      }
    });
  }

  async getLanguagePairs() {
    return await prisma.languagePair.findMany({
      include: {
        sourceLanguage: true,
        targetLanguage: true,
        translations: true
      }
    });
  }

  async getLanguagePairById(id) {
    return await prisma.languagePair.findUnique({
      where: { id },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
        translations: true
      }
    });
  }

  async updateLanguagePair(id, data) {
    const { sourceLanguageId, targetLanguageId } = data;
    return await prisma.languagePair.update({
      where: { id },
      data: {
        sourceLanguageId: sourceLanguageId || undefined,
        targetLanguageId: targetLanguageId || undefined
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
        translations: true
      }
    });
  }

  async deleteLanguagePair(id) {
    return await prisma.languagePair.delete({
      where: { id }
    });
  }

  async getLanguagePairWithTranslations(id) {
    const languagePair = await prisma.languagePair.findUnique({
      where: { id },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
        translations: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!languagePair) {
      throw new NotFoundError('Dil çifti bulunamadı');
    }

    return languagePair;
  }

  async getLanguagePairByLanguages(sourceLanguageId, targetLanguageId) {
    const languagePair = await prisma.languagePair.findFirst({
      where: {
        sourceLanguageId,
        targetLanguageId
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true
      }
    });

    if (!languagePair) {
      throw new NotFoundError('Dil çifti bulunamadı');
    }

    return languagePair;
  }
}

module.exports = LanguagePairService; 