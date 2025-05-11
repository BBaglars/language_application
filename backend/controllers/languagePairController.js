const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class LanguagePairController {
  // Tüm dil çiftlerini getir
  static async getAllLanguagePairs(req, res, next) {
    try {
      const languagePairs = await prisma.languagePair.findMany({
        include: {
          sourceLanguage: true,
          targetLanguage: true
        }
      });
      res.json({
        status: 'success',
        message: 'Dil çiftleri başarıyla listelendi',
        data: languagePairs
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Tek bir dil çiftini getir
  static async getLanguagePair(req, res, next) {
    try {
      const pairId = parseInt(req.params.id);
      const languagePair = await prisma.languagePair.findUnique({
        where: { id: pairId },
        include: {
          sourceLanguage: true,
          targetLanguage: true
        }
      });

      if (!languagePair) {
        return next(new AppError('Dil çifti bulunamadı', 404));
      }

      res.json({
        status: 'success',
        message: 'Dil çifti başarıyla getirildi',
        data: languagePair
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Yeni dil çifti ekle
  static async createLanguagePair(req, res, next) {
    try {
      const { sourceLanguageId, targetLanguageId } = req.body;

      // Kaynak dil kontrolü
      const sourceLanguage = await prisma.language.findUnique({
        where: { id: sourceLanguageId }
      });

      if (!sourceLanguage) {
        return next(new AppError('Kaynak dil bulunamadı', 404));
      }

      // Hedef dil kontrolü
      const targetLanguage = await prisma.language.findUnique({
        where: { id: targetLanguageId }
      });

      if (!targetLanguage) {
        return next(new AppError('Hedef dil bulunamadı', 404));
      }

      // Aynı dil çifti kontrolü
      const existingPair = await prisma.languagePair.findFirst({
        where: {
          sourceLanguageId,
          targetLanguageId
        }
      });

      if (existingPair) {
        return next(new AppError('Bu dil çifti zaten mevcut', 400));
      }

      const languagePair = await prisma.languagePair.create({
        data: {
          sourceLanguageId,
          targetLanguageId
        },
        include: {
          sourceLanguage: true,
          targetLanguage: true
        }
      });

      res.status(201).json({
        status: 'success',
        message: 'Dil çifti başarıyla oluşturuldu',
        data: languagePair
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Dil çiftini güncelle
  static async updateLanguagePair(req, res, next) {
    try {
      const pairId = parseInt(req.params.id);
      const { sourceLanguageId, targetLanguageId } = req.body;

      const languagePair = await prisma.languagePair.findUnique({
        where: { id: pairId }
      });

      if (!languagePair) {
        return next(new AppError('Dil çifti bulunamadı', 404));
      }

      const updatedPair = await prisma.languagePair.update({
        where: { id: pairId },
        data: {
          sourceLanguageId: sourceLanguageId || undefined,
          targetLanguageId: targetLanguageId || undefined
        },
        include: {
          sourceLanguage: true,
          targetLanguage: true
        }
      });

      res.json({
        status: 'success',
        message: 'Dil çifti başarıyla güncellendi',
        data: updatedPair
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Dil çiftini sil
  static async deleteLanguagePair(req, res, next) {
    try {
      const pairId = parseInt(req.params.id);

      const languagePair = await prisma.languagePair.findUnique({
        where: { id: pairId }
      });

      if (!languagePair) {
        return next(new AppError('Dil çifti bulunamadı', 404));
      }

      await prisma.languagePair.delete({
        where: { id: pairId }
      });

      res.json({
        status: 'success',
        message: 'Dil çifti başarıyla silindi'
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = LanguagePairController;