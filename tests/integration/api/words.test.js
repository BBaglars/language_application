const request = require('supertest');
const app = require('../../../src/backend/app');
const { pool } = require('../../../src/backend/config/database');

// Test ortamını ayarla
process.env.NODE_ENV = 'test';

// Auth middleware'ini mock'la
jest.mock('../../../src/backend/middleware/auth', () => {
  return jest.fn((req, res, next) => {
    req.user = { id: 1, username: 'test_user' };
    next();
  });
});

describe('Words API Integration Tests', () => {
  let categoryId;
  let languageId;
  let testWordId;

  beforeEach(async () => {
    // Tabloları temizle
    await pool.query('DELETE FROM word_categories');
    await pool.query('DELETE FROM translations');
    await pool.query('DELETE FROM example_sentences');
    await pool.query('DELETE FROM words');
    await pool.query('DELETE FROM categories');
    await pool.query('DELETE FROM languages');
    
    // Test dili oluştur
    const languageResult = await pool.query(
      'INSERT INTO languages (code, name, native_name) VALUES ($1, $2, $3) RETURNING id',
      ['en', 'English', 'English']
    );
    languageId = languageResult.rows[0].id;

    // Test kategorisi oluştur
    const categoryResult = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
      ['Test Kategori', 'Test açıklama']
    );
    categoryId = categoryResult.rows[0].id;

    // Test kelimesi oluştur
    const wordResult = await pool.query(
      'INSERT INTO words (word, meaning, language_id, difficulty_level) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test_word', 'test meaning', languageId, 1]
    );
    testWordId = wordResult.rows[0].id;

    // Kelimeyi kategoriye ekle
    await pool.query(
      'INSERT INTO word_categories (word_id, category_id) VALUES ($1, $2)',
      [testWordId, categoryId]
    );
  });

  describe('GET /api/words', () => {
    it('tüm kelimeleri getirmeli', async () => {
      const response = await request(app)
        .get('/api/words')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].word).toBe('test_word');
    });

    it('filtreleme parametreleri ile kelimeleri getirmeli', async () => {
      const response = await request(app)
        .get('/api/words')
        .query({ languageId, categoryId, difficultyLevel: 1 })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].word).toBe('test_word');
    });
  });

  describe('POST /api/words', () => {
    it('yeni kelime eklemeli', async () => {
      const wordData = {
        word: 'new_test_word',
        meaning: 'test meaning',
        languageId: languageId,
        difficultyLevel: 1,
        categories: [categoryId]
      };

      const response = await request(app)
        .post('/api/words')
        .send(wordData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.word).toBe(wordData.word);
      expect(response.body.meaning).toBe(wordData.meaning);
      
      // Kategori ilişkisini kontrol et
      const categoryCheck = await pool.query(
        'SELECT * FROM word_categories WHERE word_id = $1 AND category_id = $2',
        [response.body.id, categoryId]
      );
      expect(categoryCheck.rows.length).toBe(1);
    });

    it('geçersiz dil ID ile hata vermeli', async () => {
      const wordData = {
        word: 'test_word',
        meaning: 'test meaning',
        languageId: 99999,
        difficultyLevel: 1
      };

      await request(app)
        .post('/api/words')
        .send(wordData)
        .expect(404);
    });

    it('geçersiz zorunlu alanlar ile hata vermeli', async () => {
      const invalidWordData = {
        // word alanı eksik
        meaning: 'test meaning',
        languageId: languageId
      };

      const response = await request(app)
        .post('/api/words')
        .send(invalidWordData)
        .expect(400);

      expect(response.body.message).toBe('Kelime alanı boş olamaz');
    });

    it('geçersiz zorluk seviyesi ile hata vermeli', async () => {
      const invalidWordData = {
        word: 'test_word',
        meaning: 'test meaning',
        languageId: languageId,
        difficultyLevel: 6 // Geçersiz zorluk seviyesi
      };

      const response = await request(app)
        .post('/api/words')
        .send(invalidWordData)
        .expect(400);

      expect(response.body.message).toBe('Zorluk seviyesi 1-5 arasında olmalıdır');
    });

    it('veritabanı hatası durumunda 500 dönmeli', async () => {
      // Geçersiz veri ile veritabanı hatası oluştur
      const wordData = {
        word: 'a'.repeat(256), // Çok uzun kelime ile veritabanı hatası
        meaning: 'test meaning',
        languageId: languageId,
        difficultyLevel: 1
      };

      await request(app)
        .post('/api/words')
        .send(wordData)
        .expect(500);
    });

    it('geçersiz zorluk seviyesi formatı ile hata vermeli', async () => {
      const wordData = {
        word: 'test_word',
        meaning: 'test meaning',
        languageId: languageId,
        difficultyLevel: 'invalid'
      };

      const response = await request(app)
        .post('/api/words')
        .send(wordData)
        .expect(400);

      expect(response.body.message).toBe('Zorluk seviyesi sayı olmalıdır');
    });
  });

  describe('GET /api/words/:id', () => {
    it('var olan kelimeyi getirmeli', async () => {
      const response = await request(app)
        .get(`/api/words/${testWordId}`)
        .expect(200);

      expect(response.body.id).toBe(testWordId);
      expect(response.body.word).toBe('test_word');
    });

    it('var olmayan kelime için 404 dönmeli', async () => {
      await request(app)
        .get('/api/words/99999')
        .expect(404);
    });
  });

  describe('PUT /api/words/:id', () => {
    it('kelimeyi güncellemeli', async () => {
      const updateData = {
        word: 'updated_word',
        meaning: 'updated meaning',
        difficultyLevel: 2
      };

      const response = await request(app)
        .put(`/api/words/${testWordId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.word).toBe(updateData.word);
      expect(response.body.meaning).toBe(updateData.meaning);
      expect(Number(response.body.difficulty_level)).toBe(updateData.difficultyLevel);
    });

    it('boş güncelleme verisi ile hata vermeli', async () => {
      const response = await request(app)
        .put(`/api/words/${testWordId}`)
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Güncellenecek en az bir alan gereklidir');
    });

    it('geçersiz zorluk seviyesi ile güncelleme yapılmamalı', async () => {
      const response = await request(app)
        .put(`/api/words/${testWordId}`)
        .send({ difficultyLevel: 6 })
        .expect(400);

      expect(response.body.message).toBe('Zorluk seviyesi 1-5 arasında olmalıdır');
    });

    it('var olmayan kelime için 404 dönmeli', async () => {
      const response = await request(app)
        .put('/api/words/999999')
        .send({ word: 'updated' })
        .expect(404);

      expect(response.body.message).toBe('Kelime bulunamadı');
    });
  });

  describe('DELETE /api/words/:id', () => {
    it('kelimeyi silmeli', async () => {
      await request(app)
        .delete(`/api/words/${testWordId}`)
        .expect(204);

      // Kelimenin silindiğini kontrol et
      const check = await pool.query('SELECT * FROM words WHERE id = $1', [testWordId]);
      expect(check.rows.length).toBe(0);
    });

    it('var olmayan kelime için 404 dönmeli', async () => {
      const response = await request(app)
        .delete('/api/words/999999')
        .expect(404);

      expect(response.body.message).toBe('Kelime bulunamadı');
    });
  });

  describe('GET /api/words/:id/categories', () => {
    it('kelimenin kategorilerini getirmeli', async () => {
      const response = await request(app)
        .get(`/api/words/${testWordId}/categories`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(categoryId);
    });
  });

  describe('POST /api/words/:id/categories/:categoryId', () => {
    let newCategoryId;

    beforeEach(async () => {
      // Yeni bir kategori oluştur
      const result = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
        ['New Category', 'New Description']
      );
      newCategoryId = result.rows[0].id;
    });

    it('kelimeye kategori eklemeli', async () => {
      const response = await request(app)
        .post(`/api/words/${testWordId}/categories/${newCategoryId}`)
        .expect(201);

      // İlişkinin kurulduğunu kontrol et
      const check = await pool.query(
        'SELECT * FROM word_categories WHERE word_id = $1 AND category_id = $2',
        [testWordId, newCategoryId]
      );
      expect(check.rows.length).toBe(1);
    });

    it('var olmayan kelime için 404 dönmeli', async () => {
      const response = await request(app)
        .post(`/api/words/999999/categories/${newCategoryId}`)
        .expect(404);

      expect(response.body.message).toBe('Kelime bulunamadı');
    });

    it('var olmayan kategori için 404 dönmeli', async () => {
      const response = await request(app)
        .post(`/api/words/${testWordId}/categories/999999`)
        .expect(404);

      expect(response.body.message).toBe('Kategori bulunamadı');
    });

    it('zaten eklenmiş kategori için hata vermeli', async () => {
      // Önce kategoriyi ekle
      await request(app)
        .post(`/api/words/${testWordId}/categories/${newCategoryId}`)
        .expect(201);

      // Aynı kategoriyi tekrar eklemeyi dene
      const response = await request(app)
        .post(`/api/words/${testWordId}/categories/${newCategoryId}`)
        .expect(400);

      expect(response.body.message).toBe('Bu kategori zaten eklenmiş');
    });
  });

  describe('DELETE /api/words/:id/categories/:categoryId', () => {
    it('kelimeden kategoriyi kaldırmalı', async () => {
      await request(app)
        .delete(`/api/words/${testWordId}/categories/${categoryId}`)
        .expect(204);

      // İlişkinin kaldırıldığını kontrol et
      const check = await pool.query(
        'SELECT * FROM word_categories WHERE word_id = $1 AND category_id = $2',
        [testWordId, categoryId]
      );
      expect(check.rows.length).toBe(0);
    });

    it('var olmayan ilişki için 404 dönmeli', async () => {
      const response = await request(app)
        .delete(`/api/words/${testWordId}/categories/999999`)
        .expect(404);

      expect(response.body.message).toBe('Kelime-kategori ilişkisi bulunamadı');
    });
  });

  describe('GET /api/words/:id/translations', () => {
    it('kelimenin çevirilerini getirmeli', async () => {
      // Hedef dil oluştur
      const targetLanguageResult = await pool.query(
        'INSERT INTO languages (code, name, native_name) VALUES ($1, $2, $3) RETURNING id',
        ['tr', 'Turkish', 'Türkçe']
      );
      const targetLanguageId = targetLanguageResult.rows[0].id;

      // Hedef kelime oluştur
      const targetWordResult = await pool.query(
        'INSERT INTO words (word, meaning, language_id, difficulty_level) VALUES ($1, $2, $3, $4) RETURNING id',
        ['test_word_tr', 'test meaning tr', targetLanguageId, 1]
      );
      const targetWordId = targetWordResult.rows[0].id;

      // Çeviri ekle
      await pool.query(
        'INSERT INTO translations (source_word_id, target_word_id) VALUES ($1, $2)',
        [testWordId, targetWordId]
      );

      const response = await request(app)
        .get(`/api/words/${testWordId}/translations`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].word).toBe('test_word_tr');
    });

    it('çevirisi olmayan kelime için boş dizi dönmeli', async () => {
      const response = await request(app)
        .get(`/api/words/${testWordId}/translations`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it('var olmayan kelime için 404 dönmeli', async () => {
      await request(app)
        .get('/api/words/99999/translations')
        .expect(404);
    });
  });

  describe('POST /api/words/:id/translations', () => {
    let targetWordId;

    beforeEach(async () => {
      // Hedef kelimeyi oluştur
      const result = await pool.query(
        'INSERT INTO words (word, meaning, language_id) VALUES ($1, $2, $3) RETURNING id',
        ['target_word', 'target meaning', languageId]
      );
      targetWordId = result.rows[0].id;
    });

    it('kelimeye çeviri eklemeli', async () => {
      const response = await request(app)
        .post(`/api/words/${testWordId}/translations`)
        .send({ targetWordId })
        .expect(201);

      // Çeviri ilişkisini kontrol et
      const check = await pool.query(
        'SELECT * FROM translations WHERE source_word_id = $1 AND target_word_id = $2',
        [testWordId, targetWordId]
      );
      expect(check.rows.length).toBe(1);
    });

    it('eksik targetWordId ile hata vermeli', async () => {
      const response = await request(app)
        .post(`/api/words/${testWordId}/translations`)
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Hedef kelime ID\'si zorunludur');
    });

    it('var olmayan hedef kelime için 404 dönmeli', async () => {
      const response = await request(app)
        .post(`/api/words/${testWordId}/translations`)
        .send({ targetWordId: 999999 })
        .expect(404);

      expect(response.body.message).toBe('Hedef kelime bulunamadı');
    });

    it('kendisine çeviri eklerken hata vermeli', async () => {
      const response = await request(app)
        .post(`/api/words/${testWordId}/translations`)
        .send({ targetWordId: testWordId })
        .expect(400);

      expect(response.body.message).toBe('Bir kelime kendisine çeviri olarak eklenemez');
    });

    it('zaten eklenmiş çeviri için hata vermeli', async () => {
      // Önce çeviriyi ekle
      await request(app)
        .post(`/api/words/${testWordId}/translations`)
        .send({ targetWordId })
        .expect(201);

      // Aynı çeviriyi tekrar eklemeyi dene
      const response = await request(app)
        .post(`/api/words/${testWordId}/translations`)
        .send({ targetWordId })
        .expect(400);

      expect(response.body.message).toBe('Bu çeviri zaten eklenmiş');
    });
  });

  describe('DELETE /api/words/:id/translations/:translationId', () => {
    let translationId;

    beforeEach(async () => {
      // Hedef kelimeyi oluştur
      const targetWord = await pool.query(
        'INSERT INTO words (word, meaning, language_id) VALUES ($1, $2, $3) RETURNING id',
        ['target_word', 'target meaning', languageId]
      );

      // Çeviri ilişkisi oluştur
      const translation = await pool.query(
        'INSERT INTO translations (source_word_id, target_word_id) VALUES ($1, $2) RETURNING id',
        [testWordId, targetWord.rows[0].id]
      );
      translationId = translation.rows[0].id;
    });

    it('çeviriyi silmeli', async () => {
      await request(app)
        .delete(`/api/words/${testWordId}/translations/${translationId}`)
        .expect(204);

      // Çevirinin silindiğini kontrol et
      const check = await pool.query('SELECT * FROM translations WHERE id = $1', [translationId]);
      expect(check.rows.length).toBe(0);
    });

    it('var olmayan çeviri için 404 dönmeli', async () => {
      const response = await request(app)
        .delete(`/api/words/${testWordId}/translations/999999`)
        .expect(404);

      expect(response.body.message).toBe('Çeviri bulunamadı');
    });
  });
}); 