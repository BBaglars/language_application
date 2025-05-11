const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class StoryGenerationCriteriaController {
  // Tüm kriterleri getir
  static async getAllCriteria(req, res, next) {
    try {
      const criteria = await prisma.storyGenerationCriteria.findMany({
        include: {
          generationJobs: true
        }
      });
      res.json({
        status: 'success',
        message: 'Kriterler başarıyla listelendi',
        data: { criterias: criteria }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kriter detayını getir
  static async getCriteriaById(req, res, next) {
    try {
      const criteria = await prisma.storyGenerationCriteria.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          generationJobs: true
        }
      });
      if (!criteria) {
        return next(new AppError('Kriter bulunamadı', 404));
      }
      res.json({
        status: 'success',
        message: 'Kriter başarıyla getirildi',
        data: { criteria }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Yeni kriter oluştur
  static async createCriteria(req, res, next) {
    try {
      const { name, description, parameters } = req.body;
      if (!name) {
        return next(new AppError('İsim zorunludur', 400));
      }
      const criteria = await prisma.storyGenerationCriteria.create({
        data: {
          name,
          description: description || '',
          parameters: parameters || {},
          userId: req.user.id
        },
        include: {
          generationJobs: true
        }
      });
      res.status(201).json({
        status: 'success',
        message: 'Kriter başarıyla oluşturuldu',
        data: { criteria }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return next(new AppError('Bu isimde bir kriter zaten mevcut', 400));
      }
      next(new AppError(error.message, 500));
    }
  }

  // Kriter güncelle
  static async updateCriteria(req, res, next) {
    try {
      const { name, description, parameters } = req.body;
      const criteria = await prisma.storyGenerationCriteria.update({
        where: { id: parseInt(req.params.id) },
        data: {
          name: name || undefined,
          description: description || undefined,
          parameters: parameters || undefined
        },
        include: {
          generationJobs: true
        }
      });
      res.json({
        status: 'success',
        message: 'Kriter başarıyla güncellendi',
        data: { criteria }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return next(new AppError('Kriter bulunamadı', 404));
      }
      next(new AppError(error.message, 500));
    }
  }

  // Kriter sil
  static async deleteCriteria(req, res, next) {
    try {
      await prisma.storyGenerationCriteria.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return next(new AppError('Kriter bulunamadı', 404));
      }
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = StoryGenerationCriteriaController;