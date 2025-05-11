const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class CategoryService {
  async createCategory(data) {
    try {
      const category = await prisma.category.create({
        data: {
          name: data.name,
          description: data.description
        }
      });
      return category;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ValidationError('Bu kategori zaten mevcut');
      }
      throw error;
    }
  }

  async getCategoryById(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        words: true
      }
    });

    if (!category) {
      throw new NotFoundError('Kategori bulunamadı');
    }

    return category;
  }

  async getCategories() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { words: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async updateCategory(id, data) {
    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description
      }
    });
  }

  async deleteCategory(id) {
    const category = await this.getCategoryById(id);

    if (category.words.length > 0) {
      throw new ValidationError('Bu kategoriye ait kelimeler var. Önce kelimeleri silmelisiniz.');
    }

    await prisma.category.delete({
      where: { id }
    });
  }

  async getCategoryWithWords(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        words: {
          include: {
            language: true
          }
        }
      }
    });

    if (!category) {
      throw new NotFoundError('Kategori bulunamadı');
    }

    return category;
  }
}

module.exports = CategoryService;