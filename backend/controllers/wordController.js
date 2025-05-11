const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');
const WordService = require('../services/word.service.js');
const { validateWord } = require('../middleware/validation.js');
const { validateWordUpdate } = require('../middleware/validation.js');

const prisma = new PrismaClient();

class WordController {
  constructor() {
    this.wordService = new WordService();
  }

  getWords = async (req, res, next) => {
    try {
      const { search, languageId, categoryId, page = 1, limit = 10 } = req.query;
      const result = await this.wordService.getWords(
        { search, languageId, categoryId },
        { page, limit }
      );
      res.json({ status: 'success', data: { words: result.data } });
    } catch (error) {
      next(new AppError('Kelimeler alınırken bir hata oluştu', 500));
    }
  };

  getWordById = async (req, res, next) => {
    try {
      const word = await this.wordService.getWordById(req.params.id);
      if (!word) {
        return next(new AppError('Kelime bulunamadı', 404));
      }
      res.json({ status: 'success', data: { word } });
    } catch (error) {
      next(new AppError('Kelime alınırken bir hata oluştu', 500));
    }
  };

  createWord = async (req, res, next) => {
    try {
      const { error } = validateWord(req.body);
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }

      const wordData = {
        ...req.body,
        letterCount: req.body.text.length
      };
      
      const word = await this.wordService.createWord(wordData);
      res.status(201).json({ status: 'success', data: { word } });
    } catch (error) {
      next(new AppError('Kelime oluşturulurken bir hata oluştu', 500));
    }
  };

  updateWord = async (req, res, next) => {
    try {
      const { error } = validateWordUpdate(req.body);
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }

      const wordData = { ...req.body };
      
      const word = await this.wordService.updateWord(req.params.id, wordData);
      if (!word) {
        return next(new AppError('Kelime bulunamadı', 404));
      }
      res.json({ status: 'success', data: { word } });
    } catch (error) {
      next(new AppError('Kelime güncellenirken bir hata oluştu', 500));
    }
  };

  deleteWord = async (req, res, next) => {
    try {
      const word = await this.wordService.deleteWord(req.params.id);
      if (!word) {
        return next(new AppError('Kelime bulunamadı', 404));
      }
      res.status(204).send();
    } catch (error) {
      next(new AppError('Kelime silinirken bir hata oluştu', 500));
    }
  };

  getWordCategories = async (req, res, next) => {
    try {
      const word = await prisma.word.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      });

      if (!word) {
        return next(new AppError('Kelime bulunamadı', 404));
      }

      res.json(word.categories.map(wc => wc.category));
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  };

  addWordToCategory = async (req, res, next) => {
    try {
      const wordId = parseInt(req.params.id);
      const categoryId = parseInt(req.params.categoryId);

      const [word, category] = await Promise.all([
        prisma.word.findUnique({ where: { id: wordId } }),
        prisma.category.findUnique({ where: { id: categoryId } })
      ]);

      if (!word) {
        return next(new AppError('Kelime bulunamadı', 404));
      }
      if (!category) {
        return next(new AppError('Kategori bulunamadı', 404));
      }

      const wordCategory = await prisma.wordCategory.create({
        data: {
          wordId,
          categoryId
        },
        include: {
          word: true,
          category: true
        }
      });

      res.status(201).json(wordCategory);
    } catch (error) {
      if (error.code === 'P2002') {
        return next(new AppError('Bu kategori zaten eklenmiş', 400));
      }
      next(new AppError(error.message, 500));
    }
  };

  removeWordFromCategory = async (req, res, next) => {
    try {
      await prisma.wordCategory.delete({
        where: {
          wordId_categoryId: {
            wordId: parseInt(req.params.id),
            categoryId: parseInt(req.params.categoryId)
          }
        }
      });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return next(new AppError('Kelime-kategori ilişkisi bulunamadı', 404));
      }
      next(new AppError(error.message, 500));
    }
  };
}

module.exports = WordController;