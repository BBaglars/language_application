const { pool } = require('../../../src/backend/config/database');
const Language = require('../../../src/backend/models/language');

describe('Language Model Unit Tests', () => {
  describe('create', () => {
    it('geçerli dil verisi ile başarılı olmalı', async () => {
      const languageData = {
        code: 'fr',
        name: 'French',
        nativeName: 'Français'
      };

      const result = await Language.create(languageData);
      expect(result).toBeDefined();
      expect(result.code).toBe(languageData.code);
      expect(result.name).toBe(languageData.name);
      expect(result.native_name).toBe(languageData.nativeName);
    });
  });

  describe('findById', () => {
    it('var olan dili getirmeli', async () => {
      // Test dili oluştur
      const languageData = {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch'
      };
      const createdLanguage = await Language.create(languageData);

      const result = await Language.findById(createdLanguage.id);
      expect(result).toBeDefined();
      expect(result.code).toBe(languageData.code);
      expect(result.name).toBe(languageData.name);
      expect(result.native_name).toBe(languageData.nativeName);
      expect(result.word_count).toBe('0');
    });
  });

  describe('findByCode', () => {
    it('dil koduna göre dili getirmeli', async () => {
      // Test dili oluştur
      const languageData = {
        code: 'it',
        name: 'Italian',
        nativeName: 'Italiano'
      };
      await Language.create(languageData);

      const result = await Language.findByCode(languageData.code);
      expect(result).toBeDefined();
      expect(result.code).toBe(languageData.code);
      expect(result.name).toBe(languageData.name);
      expect(result.native_name).toBe(languageData.nativeName);
    });
  });

  describe('findAll', () => {
    it('tüm dilleri getirmeli', async () => {
      // Test dilleri oluştur
      const languages = [
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'pt', name: 'Portuguese', nativeName: 'Português' }
      ];

      for (const language of languages) {
        await Language.create(language);
      }

      const result = await Language.findAll();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some(lang => lang.code === 'es')).toBeTruthy();
      expect(result.some(lang => lang.code === 'pt')).toBeTruthy();
    });
  });

  describe('update', () => {
    it('dili güncellemeli', async () => {
      // Test dili oluştur
      const languageData = {
        code: 'nl',
        name: 'Dutch',
        nativeName: 'Nederlands'
      };
      const createdLanguage = await Language.create(languageData);

      // Dili güncelle
      const updateData = {
        code: 'nl',
        name: 'Dutch (Updated)',
        nativeName: 'Nederlands (Bijgewerkt)'
      };
      const result = await Language.update(createdLanguage.id, updateData);

      expect(result).toBeDefined();
      expect(result.code).toBe(updateData.code);
      expect(result.name).toBe(updateData.name);
      expect(result.native_name).toBe(updateData.nativeName);
    });
  });

  describe('delete', () => {
    it('dili silmeli', async () => {
      // Test dili oluştur
      const languageData = {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский'
      };
      const createdLanguage = await Language.create(languageData);

      // Dili sil
      const result = await Language.delete(createdLanguage.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(createdLanguage.id);

      // Silinen dili kontrol et
      const deletedLanguage = await Language.findById(createdLanguage.id);
      expect(deletedLanguage).toBeUndefined();
    });
  });

  describe('getWords', () => {
    it('dildeki kelimeleri getirmeli', async () => {
      // Test dili oluştur
      const language = await Language.create({
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語'
      });

      // Test kategorisi oluştur
      const categoryResult = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
        ['Test Category', 'Test Description']
      );
      const categoryId = categoryResult.rows[0].id;

      // Test kelimesi oluştur
      const wordResult = await pool.query(
        'INSERT INTO words (word, meaning, language_id) VALUES ($1, $2, $3) RETURNING id',
        ['テスト', 'test', language.id]
      );
      const wordId = wordResult.rows[0].id;

      // Kelimeyi kategoriye ekle
      await pool.query(
        'INSERT INTO word_categories (word_id, category_id) VALUES ($1, $2)',
        [wordId, categoryId]
      );

      // Dildeki kelimeleri getir
      const result = await Language.getWords(language.id, { limit: 10, offset: 0 });
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].word).toBe('テスト');
      expect(result[0].categories).toContain('Test Category');
    });
  });

  afterAll(async () => {
    await pool.end();
  });
}); 