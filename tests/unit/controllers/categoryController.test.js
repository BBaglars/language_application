const { pool } = require('../../../src/backend/db');
const CategoryController = require('../../../src/backend/controllers/categoryController');
const { AppError } = require('../../../src/backend/utils/errors');

// Pool mock'u
jest.mock('../../../src/backend/db', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn()
  }
}));

describe('Category Controller Unit Tests', () => {
  let categoryId = 1;

  beforeEach(async () => {
    // Her testten önce mock'ları temizle
    jest.clearAllMocks();

    // Test verilerini mock et
    pool.query.mockImplementation((query, params) => {
      if (query.includes('SELECT * FROM categories')) {
        if (params && params[0] === categoryId) {
          return Promise.resolve({ rows: [{ id: categoryId, name: 'test_category', description: 'test description' }] });
        }
        if (params && params[0] === 999) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [{ id: categoryId, name: 'test_category', description: 'test description' }] });
      }
      if (query.includes('INSERT INTO categories')) {
        return Promise.resolve({ rows: [{ id: categoryId, name: 'new_category', description: 'new description' }] });
      }
      if (query.includes('UPDATE categories')) {
        if (params && params[2] === 999) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [{ id: categoryId, name: 'updated_category', description: 'updated description' }] });
      }
      if (query.includes('DELETE FROM categories')) {
        if (params && params[0] === 999) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [{ id: categoryId }] });
      }
      if (query.includes('FROM words w JOIN word_categories')) {
        return Promise.resolve({ rows: [{ id: 1, word: 'test_word', meaning: 'test meaning' }] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  afterAll(async () => {
    // Tüm testlerden sonra bağlantıyı kapat
    await pool.end();
  });

  describe('getAllCategories', () => {
    it('tüm kategorileri getirmeli', async () => {
      const req = {};
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.getAllCategories(req, res, next);

      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('veritabanı hatası durumunda hata vermeli', async () => {
      const mockError = new Error('Veritabanı hatası');
      pool.query.mockRejectedValueOnce(mockError);

      const req = {};
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.getAllCategories(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(mockError.message);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });
  });

  describe('getCategoryById', () => {
    it('var olan kategoriyi getirmeli', async () => {
      const req = {
        params: { id: categoryId }
      };
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.getCategoryById(req, res, next);

      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('olmayan kategori için hata vermeli', async () => {
      const req = {
        params: { id: 999 }
      };
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.getCategoryById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Kategori bulunamadı');
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('createCategory', () => {
    it('geçerli kategori verisi ile başarılı olmalı', async () => {
      const req = {
        body: {
          name: 'new_category',
          description: 'new description'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.createCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('isim olmadan hata vermeli', async () => {
      const req = {
        body: {
          description: 'new description'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.createCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Kategori adı zorunludur');
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  describe('updateCategory', () => {
    it('var olan kategoriyi güncellemeli', async () => {
      const req = {
        params: { id: categoryId },
        body: {
          name: 'updated_category',
          description: 'updated description'
        }
      };
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.updateCategory(req, res, next);

      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('olmayan kategoriyi güncellemeye çalışınca hata vermeli', async () => {
      const req = {
        params: { id: 999 },
        body: {
          name: 'updated_category',
          description: 'updated description'
        }
      };
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.updateCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Kategori bulunamadı');
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('deleteCategory', () => {
    it('var olan kategoriyi silmeli', async () => {
      const req = {
        params: { id: categoryId }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.deleteCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('olmayan kategoriyi silmeye çalışınca hata vermeli', async () => {
      const req = {
        params: { id: 999 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.deleteCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Kategori bulunamadı');
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('getCategoryWords', () => {
    it('kategorideki kelimeleri getirmeli', async () => {
      const req = {
        params: { id: categoryId }
      };
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.getCategoryWords(req, res, next);

      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('veritabanı hatası durumunda hata vermeli', async () => {
      const mockError = new Error('Veritabanı hatası');
      pool.query.mockRejectedValueOnce(mockError);

      const req = { params: { id: categoryId } };
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await CategoryController.getCategoryWords(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(mockError.message);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });
  });
}); 