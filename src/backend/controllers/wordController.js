const { pool } = require('../config/database');
const { AppError } = require('../utils/errors');
const Word = require('../models/word');

class WordController {
  static async createWord(req, res, next) {
    try {
      const { word, meaning, languageId, difficultyLevel, categories } = req.body;
      
      // Zorunlu alan kontrolü
      if (!word || word.trim() === '') {
        return next(new AppError('Kelime alanı boş olamaz', 400));
      }

      // Kelime uzunluğu kontrolü
      if (word.length > 255) {
        return next(new AppError('Kelime çok uzun', 500));
      }

      // Zorluk seviyesi formatı kontrolü
      if (difficultyLevel && isNaN(difficultyLevel)) {
        return next(new AppError('Zorluk seviyesi sayı olmalıdır', 400));
      }

      // Zorluk seviyesi aralık kontrolü
      if (difficultyLevel && (difficultyLevel < 1 || difficultyLevel > 5)) {
        return next(new AppError('Zorluk seviyesi 1-5 arasında olmalıdır', 400));
      }

      // Dil kontrolü
      const languageCheck = await pool.query('SELECT * FROM languages WHERE id = $1', [languageId]);
      if (languageCheck.rows.length === 0) {
        return next(new AppError('Dil bulunamadı', 404));
      }

      // Kelimeyi oluştur
      const newWord = await Word.create({ word, meaning, languageId, difficultyLevel });

      // Kategorileri ekle
      if (categories && categories.length > 0) {
        for (const categoryId of categories) {
          // Kategori kontrolü
          const categoryCheck = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
          if (categoryCheck.rows.length === 0) {
            continue; // Geçersiz kategoriyi atla
          }
          await Word.addToCategory(newWord.id, categoryId);
        }
      }

      // Güncel kelime bilgilerini getir
      const wordWithDetails = await Word.findById(newWord.id);
      res.status(201).json(wordWithDetails);
    } catch (error) {
      if (error.code === '23505') {
        return next(new AppError('Bu kelime zaten mevcut', 400));
      }
      next(new AppError('Kelime oluşturulurken bir hata oluştu', 500));
    }
  }

  static async getWords(req, res, next) {
    try {
      const { limit = 10, offset = 0, languageId, categoryId, difficultyLevel } = req.query;
      const words = await Word.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        languageId: languageId ? parseInt(languageId) : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        difficultyLevel: difficultyLevel ? parseInt(difficultyLevel) : null
      });
      res.json(words);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  static async getWordById(req, res, next) {
    try {
      const word = await Word.findById(req.params.id);
      if (!word) {
        return next(new AppError('Kelime bulunamadı', 404));
      }
      res.json(word);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  static async updateWord(req, res, next) {
    try {
      const { word, meaning, languageId, difficultyLevel } = req.body;

      // Boş güncelleme kontrolü
      if (!word && !meaning && !languageId && difficultyLevel === undefined) {
        return next(new AppError('Güncellenecek en az bir alan gereklidir', 400));
      }

      // Kelime alanı kontrolü
      if (word !== undefined && word.trim() === '') {
        return next(new AppError('Kelime alanı boş olamaz', 400));
      }

      // Zorluk seviyesi formatı kontrolü
      if (difficultyLevel !== undefined && isNaN(difficultyLevel)) {
        return next(new AppError('Zorluk seviyesi sayı olmalıdır', 400));
      }

      // Zorluk seviyesi aralık kontrolü
      if (difficultyLevel !== undefined && (difficultyLevel < 1 || difficultyLevel > 5)) {
        return next(new AppError('Zorluk seviyesi 1-5 arasında olmalıdır', 400));
      }

      // Dil kontrolü
      if (languageId) {
        const languageCheck = await pool.query('SELECT * FROM languages WHERE id = $1', [languageId]);
        if (languageCheck.rows.length === 0) {
          return next(new AppError('Dil bulunamadı', 404));
        }
      }

      const updatedWord = await Word.update(req.params.id, {
        word,
        meaning,
        languageId,
        difficultyLevel
      });
      res.json(updatedWord);
    } catch (error) {
      if (error.message === 'Kelime bulunamadı') {
        return next(new AppError(error.message, 404));
      }
      if (error.code === '23505') {
        return next(new AppError('Bu kelime zaten mevcut', 400));
      }
      next(new AppError('Kelime güncellenirken bir hata oluştu', 500));
    }
  }

  static async deleteWord(req, res, next) {
    try {
      await Word.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Kelime bulunamadı') {
        return next(new AppError(error.message, 404));
      }
      next(new AppError(error.message, 500));
    }
  }

  static async getWordCategories(req, res, next) {
    try {
      const { rows } = await pool.query(
        `SELECT c.* FROM categories c
         JOIN word_categories wc ON c.id = wc.category_id
         WHERE wc.word_id = $1`,
        [req.params.id]
      );
      res.json(rows);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  static async addWordToCategory(req, res, next) {
    try {
      // Kategori ID formatı kontrolü
      if (isNaN(req.params.categoryId)) {
        return next(new AppError('Geçersiz kategori ID formatı', 400));
      }

      // Kelime kontrolü
      const wordCheck = await Word.findById(req.params.id);
      if (!wordCheck) {
        return next(new AppError('Kelime bulunamadı', 404));
      }

      // Kategori kontrolü
      const categoryCheck = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.categoryId]);
      if (categoryCheck.rows.length === 0) {
        return next(new AppError('Kategori bulunamadı', 404));
      }

      // İlişki kontrolü
      const relationCheck = await pool.query(
        'SELECT * FROM word_categories WHERE word_id = $1 AND category_id = $2',
        [req.params.id, req.params.categoryId]
      );
      if (relationCheck.rows.length > 0) {
        return next(new AppError('Bu kategori zaten eklenmiş', 400));
      }

      const result = await Word.addToCategory(req.params.id, req.params.categoryId);
      res.status(201).json(result);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  static async removeWordFromCategory(req, res, next) {
    try {
      await Word.removeFromCategory(req.params.id, req.params.categoryId);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Kelime-kategori ilişkisi bulunamadı') {
        return next(new AppError(error.message, 404));
      }
      next(new AppError(error.message, 500));
    }
  }

  static async getWordTranslations(req, res, next) {
    try {
      // Kelime kontrolü
      const wordCheck = await Word.findById(req.params.id);
      if (!wordCheck) {
        return next(new AppError('Kelime bulunamadı', 404));
      }

      const translations = await Word.getTranslations(req.params.id);
      res.json(translations);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  static async addTranslation(req, res, next) {
    try {
      const { targetWordId } = req.body;

      // targetWordId kontrolü
      if (!targetWordId) {
        return next(new AppError('Hedef kelime ID\'si zorunludur', 400));
      }

      // Hedef kelime ID formatı kontrolü
      if (isNaN(targetWordId)) {
        return next(new AppError('Geçersiz hedef kelime ID formatı', 400));
      }

      // Kaynak kelime kontrolü
      const sourceWord = await Word.findById(req.params.id);
      if (!sourceWord) {
        return next(new AppError('Kelime bulunamadı', 404));
      }

      // Hedef kelimenin varlığını kontrol et
      const targetWord = await Word.findById(targetWordId);
      if (!targetWord) {
        return next(new AppError('Hedef kelime bulunamadı', 404));
      }

      // Kendisine çeviri eklemeyi engelle
      if (req.params.id === targetWordId.toString()) {
        return next(new AppError('Bir kelime kendisine çeviri olarak eklenemez', 400));
      }

      // Çeviri kontrolü
      const translationCheck = await pool.query(
        'SELECT * FROM translations WHERE (source_word_id = $1 AND target_word_id = $2) OR (source_word_id = $2 AND target_word_id = $1)',
        [req.params.id, targetWordId]
      );
      if (translationCheck.rows.length > 0) {
        return next(new AppError('Bu çeviri zaten eklenmiş', 400));
      }

      const result = await Word.addTranslation(req.params.id, targetWordId);
      res.status(201).json(result);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  static async removeTranslation(req, res, next) {
    try {
      const { rows } = await pool.query(
        'DELETE FROM translations WHERE id = $1 RETURNING *',
        [req.params.translationId]
      );
      if (rows.length === 0) {
        return next(new AppError('Çeviri bulunamadı', 404));
      }
      res.status(204).send();
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = WordController; 