const { pool } = require('../../../src/backend/config/database');
const Category = require('../../../src/backend/models/category');

describe('Category Model Unit Tests', () => {
  describe('create', () => {
    it('geçerli kategori verisi ile başarılı olmalı', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test Description'
      };

      const result = await Category.create(categoryData);
      expect(result).toBeDefined();
      expect(result.name).toBe(categoryData.name);
      expect(result.description).toBe(categoryData.description);
    });
  });

  describe('findById', () => {
    it('var olan kategoriyi getirmeli', async () => {
      // Test kategorisi oluştur
      const categoryData = {
        name: 'Test Category',
        description: 'Test Description'
      };
      const createdCategory = await Category.create(categoryData);

      const result = await Category.findById(createdCategory.id);
      expect(result).toBeDefined();
      expect(result.name).toBe(categoryData.name);
      expect(result.description).toBe(categoryData.description);
    });
  });

  describe('findAll', () => {
    it('tüm kategorileri getirmeli', async () => {
      // Test kategorileri oluştur
      const categories = [
        { name: 'Category 1', description: 'Description 1' },
        { name: 'Category 2', description: 'Description 2' }
      ];

      for (const category of categories) {
        await Category.create(category);
      }

      const result = await Category.findAll();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some(cat => cat.name === 'Category 1')).toBeTruthy();
      expect(result.some(cat => cat.name === 'Category 2')).toBeTruthy();
    });
  });

  describe('update', () => {
    it('kategoriyi güncellemeli', async () => {
      // Test kategorisi oluştur
      const categoryData = {
        name: 'Test Category',
        description: 'Test Description'
      };
      const createdCategory = await Category.create(categoryData);

      // Kategoriyi güncelle
      const updateData = {
        name: 'Updated Category',
        description: 'Updated Description'
      };
      const result = await Category.update(createdCategory.id, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
    });
  });

  describe('delete', () => {
    it('kategoriyi silmeli', async () => {
      // Test kategorisi oluştur
      const categoryData = {
        name: 'Test Category',
        description: 'Test Description'
      };
      const createdCategory = await Category.create(categoryData);

      // Kategoriyi sil
      const result = await Category.delete(createdCategory.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(createdCategory.id);

      // Silinen kategoriyi kontrol et
      const deletedCategory = await Category.findById(createdCategory.id);
      expect(deletedCategory).toBeUndefined();
    });
  });

  describe('getWords', () => {
    it('kategorideki kelimeleri getirmeli', async () => {
      // Test kategorisi oluştur
      const category = await Category.create({
        name: 'Test Category',
        description: 'Test Description'
      });

      // Test dili oluştur
      const languageResult = await pool.query(
        'INSERT INTO languages (code, name) VALUES ($1, $2) RETURNING id',
        ['en', 'English']
      );
      const languageId = languageResult.rows[0].id;

      // Test kelimesi oluştur
      const wordResult = await pool.query(
        'INSERT INTO words (word, meaning, language_id) VALUES ($1, $2, $3) RETURNING id',
        ['test', 'test meaning', languageId]
      );
      const wordId = wordResult.rows[0].id;

      // Kelimeyi kategoriye ekle
      await pool.query(
        'INSERT INTO word_categories (word_id, category_id) VALUES ($1, $2)',
        [wordId, category.id]
      );

      // Kategorideki kelimeleri getir
      const result = await Category.getWords(category.id, { limit: 10, offset: 0 });
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].word).toBe('test');
    });
  });

  afterAll(async () => {
    await pool.end();
  });
}); 