const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class CategoryController {
  // Tüm kategorileri getir
  static async getAllCategories(req, res, next) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          words: true
        }
      });
      res.json({ status: 'success', data: { categories } });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Tek bir kategoriyi getir
  static async getCategory(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          words: true
        }
      });

      if (!category) {
        return next(new AppError('Kategori bulunamadı', 404));
      }

      res.json({ status: 'success', data: { category } });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Yeni kategori ekle
  static async createCategory(req, res, next) {
    try {
      const { name, description } = req.body;

      // İsim kontrolü
      const existingCategory = await prisma.category.findFirst({
        where: { name }
      });

      if (existingCategory) {
        return next(new AppError('Bu kategori adı zaten kullanımda', 400));
      }

      const category = await prisma.category.create({
        data: {
          name,
          description
        }
      });

      res.status(201).json({ status: 'success', data: { category } });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kategori güncelle
  static async updateCategory(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;

      // Kategori kontrolü
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!existingCategory) {
        return next(new AppError('Kategori bulunamadı', 404));
      }

      // İsim kontrolü
      if (name && name !== existingCategory.name) {
        const categoryWithName = await prisma.category.findFirst({
          where: { name }
        });

        if (categoryWithName) {
          return next(new AppError('Bu kategori adı zaten kullanımda', 400));
        }
      }

      const category = await prisma.category.update({
        where: { id: categoryId },
        data: {
          name: name || undefined,
          description: description || undefined
        }
      });

      res.json({ status: 'success', data: { category } });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kategori sil
  static async deleteCategory(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id);

      // Kategori kontrolü
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return next(new AppError('Kategori bulunamadı', 404));
      }

      // İlişkili kelimeleri kontrol et
      const wordCount = await prisma.wordCategory.count({
        where: { categoryId }
      });

      if (wordCount > 0) {
        return next(new AppError('Bu kategoriye ait kelimeler var. Önce kelimeleri silmelisiniz.', 400));
      }

      await prisma.category.delete({
        where: { id: categoryId }
      });

      res.status(204).send();
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kategorideki kelimeleri getir
  static async getCategoryWords(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id);

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          words: {
            include: {
              word: {
                include: {
                  language: true
                }
              }
            }
          }
        }
      });

      if (!category) {
        return next(new AppError('Kategori bulunamadı', 404));
      }

      // Kelimeleri düz bir dizi olarak döndür
      const words = category.words.map(wc => wc.word);
      res.json({ status: 'success', data: { words } });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = CategoryController; 