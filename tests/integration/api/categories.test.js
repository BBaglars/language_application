const request = require('supertest');
const app = require('../../../src/backend/app');
const { pool } = require('../../../src/backend/db');

// Test ortamını ayarla
process.env.NODE_ENV = 'test';

// Auth middleware'ini mock'la
jest.mock('../../../src/backend/middleware/auth', () => {
  return jest.fn((req, res, next) => {
    req.user = { id: 1, username: 'test_user' };
    next();
  });
});

describe('Categories API Integration Tests', () => {
  beforeEach(async () => {
    // Önce word_categories tablosunu temizle
    await pool.query('DELETE FROM word_categories');
    // Sonra words tablosunu temizle
    await pool.query('DELETE FROM words');
    // En son categories tablosunu temizle
    await pool.query('DELETE FROM categories');
    
    // Test kategorisini ekle
    await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2)',
      ['Test Kategori', 'Test açıklama']
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        name: 'Yeni Kategori',
        description: 'Yeni açıklama'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newCategory.name);
      expect(response.body.description).toBe(newCategory.description);
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ description: 'Açıklama' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Kategori adı zorunludur');
    });

    it('boş isim ile kategori oluşturulmamalı', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: '', description: 'Açıklama' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Kategori adı zorunludur');
    });

    it('aynı isimle kategori oluşturulabilmeli', async () => {
      const categoryData = {
        name: 'Tekrar Eden Kategori',
        description: 'Açıklama'
      };

      // İlk kategoriyi oluştur
      await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(201);

      // Aynı isimle ikinci kategoriyi oluştur
      const response = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty('name', categoryData.name);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update an existing category', async () => {
      // Önce bir kategori oluştur
      const { rows } = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
        ['Güncellenecek Kategori', 'Güncellenecek açıklama']
      );

      const updatedCategory = {
        name: 'Güncellenmiş Kategori',
        description: 'Güncellenmiş açıklama'
      };

      const response = await request(app)
        .put(`/api/categories/${rows[0].id}`)
        .send(updatedCategory)
        .expect(200);

      expect(response.body.name).toBe(updatedCategory.name);
      expect(response.body.description).toBe(updatedCategory.description);
    });

    it('should return 404 if category does not exist', async () => {
      const response = await request(app)
        .put('/api/categories/999')
        .send({ name: 'Güncellenmiş', description: 'Açıklama' })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Kategori bulunamadı');
    });

    it('boş isim ile güncelleme yapılmamalı', async () => {
      const { rows } = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
        ['Güncellenecek Kategori', 'Açıklama']
      );

      const response = await request(app)
        .put(`/api/categories/${rows[0].id}`)
        .send({ name: '', description: 'Yeni açıklama' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Kategori adı zorunludur');
    });

    it('geçersiz ID formatı için 500 dönmeli', async () => {
      const response = await request(app)
        .put('/api/categories/invalid-id')
        .send({ name: 'Yeni İsim', description: 'Açıklama' })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete an existing category', async () => {
      // Önce bir kategori oluştur
      const { rows } = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
        ['Silinecek Kategori', 'Silinecek açıklama']
      );

      await request(app)
        .delete(`/api/categories/${rows[0].id}`)
        .expect(204);
    });

    it('should return 404 if category does not exist', async () => {
      const response = await request(app)
        .delete('/api/categories/999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Kategori bulunamadı');
    });
  });

  describe('GET /api/categories/:id', () => {
    it('var olan kategoriyi getirmeli', async () => {
      const { rows } = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
        ['Test Kategori', 'Test açıklama']
      );

      const response = await request(app)
        .get(`/api/categories/${rows[0].id}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Test Kategori');
      expect(response.body).toHaveProperty('description', 'Test açıklama');
    });

    it('var olmayan kategori için 404 dönmeli', async () => {
      const response = await request(app)
        .get('/api/categories/999')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Kategori bulunamadı');
    });

    it('geçersiz ID formatı için 500 dönmeli', async () => {
      const response = await request(app)
        .get('/api/categories/invalid-id')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/categories/:id/words', () => {
    it('kategorideki kelimeleri getirmeli', async () => {
      // Önce bir kelime ve kategori-kelime ilişkisi oluştur
      const { rows: categoryRows } = await pool.query('SELECT id FROM categories LIMIT 1');
      const categoryId = categoryRows[0].id;

      const { rows: wordRows } = await pool.query(
        'INSERT INTO words (word, meaning) VALUES ($1, $2) RETURNING id',
        ['test_word', 'test meaning']
      );
      const wordId = wordRows[0].id;

      await pool.query(
        'INSERT INTO word_categories (word_id, category_id) VALUES ($1, $2)',
        [wordId, categoryId]
      );

      const response = await request(app)
        .get(`/api/categories/${categoryId}/words`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('word');
      expect(response.body[0]).toHaveProperty('meaning');
    });

    it('var olmayan kategori için boş dizi dönmeli', async () => {
      const response = await request(app)
        .get('/api/categories/999/words')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it('geçersiz ID formatı için 500 dönmeli', async () => {
      const response = await request(app)
        .get('/api/categories/invalid-id/words')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });
}); 