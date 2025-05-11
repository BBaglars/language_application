const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');
const TranslationService = require('../services/translation.service.js');
const { validateTranslation } = require('../middleware/validation.js');

const prisma = new PrismaClient();

class TranslationController {
  constructor() {
    this.translationService = new TranslationService();
  }

  getTranslations = async (req, res, next) => {
    try {
      const { languagePairId, page = 1, limit = 10 } = req.query;
      const result = await this.translationService.getTranslations(
        { languagePairId },
        { page, limit }
      );
      res.json({
        status: 'success',
        message: 'Çeviriler başarıyla listelendi',
        data: { translations: result.data }
      });
    } catch (error) {
      next(new AppError('Çeviriler alınırken bir hata oluştu', 500));
    }
  };

  getTranslationById = async (req, res, next) => {
    try {
      const translation = await this.translationService.getTranslationById(req.params.id);
      if (!translation) {
        return next(new AppError('Çeviri bulunamadı', 404));
      }
      res.json({
        status: 'success',
        message: 'Çeviri başarıyla getirildi',
        data: { translation }
      });
    } catch (error) {
      next(new AppError('Çeviri alınırken bir hata oluştu', 500));
    }
  };

  createTranslation = async (req, res, next) => {
    try {
      const { error } = validateTranslation(req.body);
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }

      const translation = await this.translationService.createTranslation(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Çeviri başarıyla oluşturuldu',
        data: { translation }
      });
    } catch (error) {
      next(new AppError('Çeviri oluşturulurken bir hata oluştu', 500));
    }
  };

  updateTranslation = async (req, res, next) => {
    try {
      const { error } = validateTranslation(req.body);
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }

      const translation = await this.translationService.updateTranslation(
        req.params.id,
        req.body
      );
      if (!translation) {
        return next(new AppError('Çeviri bulunamadı', 404));
      }
      res.json({
        status: 'success',
        message: 'Çeviri başarıyla güncellendi',
        data: { translation }
      });
    } catch (error) {
      next(new AppError('Çeviri güncellenirken bir hata oluştu', 500));
    }
  };

  deleteTranslation = async (req, res, next) => {
    try {
      const translation = await this.translationService.deleteTranslation(req.params.id);
      if (!translation) {
        return next(new AppError('Çeviri bulunamadı', 404));
      }
      res.json({
        status: 'success',
        message: 'Çeviri başarıyla silindi',
        data: { translation }
      });
    } catch (error) {
      next(new AppError('Çeviri silinirken bir hata oluştu', 500));
    }
  };

  getTranslationsByLanguagePair = async (req, res, next) => {
    try {
      const { languagePairId } = req.params;
      const translations = await this.translationService.getTranslationsByLanguagePair(
        languagePairId
      );
      res.json({
        status: 'success',
        message: 'Dil çiftine ait çeviriler başarıyla listelendi',
        data: { translations }
      });
    } catch (error) {
      next(new AppError('Çeviriler alınırken bir hata oluştu', 500));
    }
  };
}

module.exports = TranslationController;