const { pool } = require('../../../src/backend/config/database');
const WordController = require('../../../src/backend/controllers/wordController');
const { AppError } = require('../../../src/backend/utils/errors');
const Word = require('../../../src/backend/models/word');

// Word modülünü mock'la
jest.mock('../../../src/backend/models/word', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addToCategory: jest.fn(),
  removeFromCategory: jest.fn(),
  getTranslations: jest.fn(),
  addTranslation: jest.fn(),
  removeTranslation: jest.fn(),
  findAll: jest.fn()
}));

// Database pool'u mock'la
jest.mock('../../../src/backend/config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('Word Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { id: '1', categoryId: '1', translationId: '1' },
      body: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('createWord', () => {
    it('geçerli kelime verisi ile başarılı olmalı', async () => {
      const mockWord = {
        id: 1,
        word: 'test',
        meaning: 'test anlamı'
      };

      req.body = {
        word: 'test',
        meaning: 'test anlamı',
        languageId: 1
      };

      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // language check
      Word.create.mockResolvedValueOnce({ id: 1, ...req.body });
      Word.findById.mockResolvedValueOnce(mockWord);

      await WordController.createWord(req, res, next);

      expect(Word.create).toHaveBeenCalledWith(expect.objectContaining({
        word: 'test',
        meaning: 'test anlamı',
        languageId: 1
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockWord);
    });

    it('geçersiz kategori ID ile hata vermeli', async () => {
      req.body = {
        word: 'test',
        meaning: 'test anlamı',
        languageId: 999
      };

      pool.query.mockResolvedValueOnce({ rows: [] }); // language not found

      await WordController.createWord(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Dil bulunamadı');
    });
  });

  describe('deleteWord', () => {
    it('olmayan kelimeyi silmeye çalışınca hata vermeli', async () => {
      Word.delete.mockRejectedValueOnce(new Error('Kelime bulunamadı'));

      await WordController.deleteWord(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Kelime bulunamadı');
    });
  });

  describe('getWordCategories', () => {
    it('veritabanı hatası durumunda hata vermeli', async () => {
      const error = new Error('Veritabanı hatası');
      pool.query.mockRejectedValueOnce(error);

      await WordController.getWordCategories(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Veritabanı hatası');
    });
  });

  describe('addWordToCategory', () => {
    it('kelimeyi kategoriye eklemeli', async () => {
      const mockWord = { id: 1, word: 'test' };
      const mockResult = { wordId: 1, categoryId: 1 };
      
      Word.findById.mockResolvedValueOnce(mockWord);
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // category check
      pool.query.mockResolvedValueOnce({ rows: [] }); // relation check
      Word.addToCategory.mockResolvedValueOnce(mockResult);

      await WordController.addWordToCategory(req, res, next);

      expect(Word.findById).toHaveBeenCalledWith('1');
      expect(Word.addToCategory).toHaveBeenCalledWith('1', '1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getWordTranslations', () => {
    it('kelimenin çevirilerini getirmeli', async () => {
      const mockWord = { id: 1, word: 'test' };
      const mockTranslations = [{ id: 1, translation: 'test_tr' }];

      Word.findById.mockResolvedValueOnce(mockWord);
      Word.getTranslations.mockResolvedValueOnce(mockTranslations);

      await WordController.getWordTranslations(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockTranslations);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('removeTranslation', () => {
    it('çeviriyi silmeli', async () => {
      // Mock setup
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // translation exists

      await WordController.removeTranslation(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM translations WHERE id = $1 RETURNING *',
        ['1']
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('olmayan çeviriyi silmeye çalışınca hata vermeli', async () => {
      // Mock setup
      pool.query.mockResolvedValueOnce({ rows: [] }); // translation not found

      await WordController.removeTranslation(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM translations WHERE id = $1 RETURNING *',
        ['1']
      );
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Çeviri bulunamadı');
    });
  });

  describe('getWords', () => {
    it('veritabanı hatası durumunda hata vermeli', async () => {
      const mockError = new Error('Veritabanı hatası');
      Word.findAll.mockRejectedValueOnce(mockError);

      req.query = { limit: 10, offset: 0 };

      await WordController.getWords(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Veritabanı hatası');
    });
  });
}); 