const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class LanguageService {
  async createLanguage(data) {
    const { name, code } = data;
    return await prisma.language.create({
      data: {
        name,
        code
      }
    });
  }

  async getLanguages() {
    return await prisma.language.findMany({
      include: {
        words: true,
        sourceLanguages: true,
        targetLanguages: true,
        stories: true
      }
    });
  }

  async getLanguageById(id) {
    return await prisma.language.findUnique({
      where: { id },
      include: {
        words: true,
        sourceLanguages: true,
        targetLanguages: true,
        stories: true
      }
    });
  }

  async updateLanguage(id, data) {
    const { name, code } = data;
    return await prisma.language.update({
      where: { id },
      data: {
        name: name || undefined,
        code: code || undefined
      }
    });
  }

  async deleteLanguage(id) {
    return await prisma.language.delete({
      where: { id }
    });
  }

  async getLanguageWithWords(id) {
    const language = await prisma.language.findUnique({
      where: { id },
      include: {
        words: true
      }
    });

    if (!language) {
      throw new NotFoundError('Dil bulunamadı');
    }

    return language;
  }

  async getLanguageByCode(code) {
    const language = await prisma.language.findFirst({
      where: { code }
    });

    if (!language) {
      throw new NotFoundError('Dil bulunamadı');
    }

    return language;
  }
}

module.exports = LanguageService; 