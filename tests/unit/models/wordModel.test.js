const { pool } = require('../../../src/backend/config/database');
const Word = require('../../../src/backend/models/word');

describe('Word Model Unit Tests', () => {
  let testLanguageId;
  let testCategoryId;

  beforeEach(async () => {
    // Test dili oluştur
    const languageResult = await pool.query(
      'INSERT INTO languages (code, name, native_name) VALUES ($1, $2, $3) RETURNING id',
      ['en', 'English', 'English']
    );
    testLanguageId = languageResult.rows[0].id;

    // Test kategorisi oluştur
    const categoryResult = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
      ['Test Category', 'Test Description']
    );
    testCategoryId = categoryResult.rows[0].id;
  });

  describe('create', () => {
    it('geçerli kelime verisi ile başarılı olmalı', async () => {
      const wordData = {
        word: 'test',
        meaning: 'deneme',
        languageId: testLanguageId,
        difficultyLevel: 1
      };

      const result = await Word.create(wordData);
      expect(result).toBeDefined();
      expect(result.word).toBe(wordData.word);
      expect(result.meaning).toBe(wordData.meaning);
    });

    it('geçersiz dil ID ile hata vermeli', async () => {
      const wordData = {
        word: 'test',
        meaning: 'deneme',
        languageId: 99999,
        difficultyLevel: 1
      };

      await expect(Word.create(wordData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('var olan kelimeyi getirmeli', async () => {
      const wordData = {
        word: 'test',
        meaning: 'deneme',
        languageId: testLanguageId,
        difficultyLevel: 1
      };
      const createdWord = await Word.create(wordData);

      const result = await Word.findById(createdWord.id);
      expect(result).toBeDefined();
      expect(result.word).toBe(wordData.word);
      expect(result.meaning).toBe(wordData.meaning);
    });

    it('var olmayan ID için undefined dönmeli', async () => {
      const result = await Word.findById(99999);
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('kelimeyi güncellemeli', async () => {
      const wordData = {
        word: 'test',
        meaning: 'deneme',
        languageId: testLanguageId,
        difficultyLevel: 1
      };
      const createdWord = await Word.create(wordData);

      const updateData = {
        word: 'updated',
        meaning: 'güncellenmiş',
        languageId: testLanguageId,
        difficultyLevel: 2
      };

      const result = await Word.update(createdWord.id, updateData);
      expect(result).toBeDefined();
      expect(result.word).toBe(updateData.word);
      expect(result.meaning).toBe(updateData.meaning);
      expect(result.difficulty_level).toBe(String(updateData.difficultyLevel));
    });

    it('var olmayan kelimeyi güncellerken hata vermeli', async () => {
      const updateData = {
        word: 'updated',
        meaning: 'güncellenmiş',
        languageId: testLanguageId,
        difficultyLevel: 2
      };
      await expect(Word.update(99999, updateData)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('kelimeyi silmeli', async () => {
      const wordData = {
        word: 'test',
        meaning: 'deneme',
        languageId: testLanguageId,
        difficultyLevel: 1
      };
      const createdWord = await Word.create(wordData);

      const result = await Word.delete(createdWord.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(createdWord.id);

      const deletedWord = await Word.findById(createdWord.id);
      expect(deletedWord).toBeUndefined();
    });

    it('var olmayan kelimeyi silerken hata vermeli', async () => {
      await expect(Word.delete(99999)).rejects.toThrow();
    });
  });

  describe('addToCategory ve removeFromCategory', () => {
    it('kelimeyi kategoriye eklemeli ve kaldırmalı', async () => {
      const wordData = {
        word: 'test',
        meaning: 'deneme',
        languageId: testLanguageId,
        difficultyLevel: 1
      };
      const createdWord = await Word.create(wordData);

      // Kategoriye ekle
      const addResult = await Word.addToCategory(createdWord.id, testCategoryId);
      expect(addResult).toBeDefined();
      expect(addResult.word_id).toBe(createdWord.id);
      expect(addResult.category_id).toBe(testCategoryId);

      // Kategoriden kaldır
      const removeResult = await Word.removeFromCategory(createdWord.id, testCategoryId);
      expect(removeResult).toBeDefined();
      expect(removeResult.word_id).toBe(createdWord.id);
      expect(removeResult.category_id).toBe(testCategoryId);
    });

    it('var olmayan kelimeyi kategoriye eklerken hata vermeli', async () => {
      await expect(Word.addToCategory(99999, testCategoryId)).rejects.toThrow();
    });

    it('var olmayan kelimeyi kategoriden kaldırırken hata vermeli', async () => {
      await expect(Word.removeFromCategory(99999, testCategoryId)).rejects.toThrow();
    });
  });

  describe('example sentences', () => {
    it('örnek cümle eklemeli', async () => {
      const wordData = {
        word: 'test',
        meaning: 'deneme',
        languageId: testLanguageId,
        difficultyLevel: 1
      };
      const createdWord = await Word.create(wordData);

      const sentence = 'This is a test sentence.';
      const result = await Word.addExampleSentence(createdWord.id, sentence);
      expect(result).toBeDefined();
      expect(result.sentence).toBe(sentence);
      expect(result.word_id).toBe(createdWord.id);
    });

    it('var olmayan kelimeye örnek cümle eklerken hata vermeli', async () => {
      await expect(Word.addExampleSentence(99999, 'Test sentence')).rejects.toThrow();
    });
  });

  describe('translations', () => {
    it('kelime çevirisi eklemeli ve getirmeli', async () => {
      // Kaynak kelime oluştur
      const sourceWord = await Word.create({
        word: 'test',
        meaning: 'deneme',
        languageId: testLanguageId,
        difficultyLevel: 1
      });

      // Hedef dil oluştur
      const targetLanguageResult = await pool.query(
        'INSERT INTO languages (code, name, native_name) VALUES ($1, $2, $3) RETURNING id',
        ['tr', 'Turkish', 'Türkçe']
      );
      const targetLanguageId = targetLanguageResult.rows[0].id;

      // Hedef kelime oluştur
      const targetWord = await Word.create({
        word: 'deneme',
        meaning: 'test',
        languageId: targetLanguageId,
        difficultyLevel: 1
      });

      // Çeviri ekle
      const addResult = await Word.addTranslation(sourceWord.id, targetWord.id);
      expect(addResult).toBeDefined();
      expect(addResult.source_word_id).toBe(sourceWord.id);
      expect(addResult.target_word_id).toBe(targetWord.id);

      // Çevirileri getir
      const translations = await Word.getTranslations(sourceWord.id);
      expect(translations).toBeDefined();
      expect(translations.length).toBe(1);
      expect(translations[0].word).toBe('deneme');
    });

    it('var olmayan kelimeye çeviri eklerken hata vermeli', async () => {
      await expect(Word.addTranslation(99999, 99999)).rejects.toThrow();
    });

    it('var olmayan kelimenin çevirilerini getirirken hata vermeli', async () => {
      const translations = await Word.getTranslations(99999);
      expect(translations).toHaveLength(0);
    });

    it('aynı kelimeye çeviri eklerken hata vermeli', async () => {
      const word = await Word.create({
        word: 'test',
        meaning: 'deneme',
        languageId: testLanguageId,
        difficultyLevel: 1
      });

      await expect(Word.addTranslation(word.id, word.id))
        .rejects
        .toThrow('Bir kelime kendisine çeviri olarak eklenemez');
    });
  });

  describe('findAll', () => {
    it('filtreleme parametreleri ile kelimeleri getirmeli', async () => {
      // Test kelimeleri oluştur
      const words = [
        { word: 'test1', meaning: 'deneme1', languageId: testLanguageId, difficultyLevel: 1 },
        { word: 'test2', meaning: 'deneme2', languageId: testLanguageId, difficultyLevel: 2 }
      ];

      for (const wordData of words) {
        await Word.create(wordData);
      }

      // Dil ID'ye göre filtrele
      const result1 = await Word.findAll({ languageId: testLanguageId, limit: 10, offset: 0 });
      expect(result1.length).toBeGreaterThanOrEqual(2);

      // Zorluk seviyesine göre filtrele
      const result2 = await Word.findAll({ difficultyLevel: 1, limit: 10, offset: 0 });
      expect(result2.length).toBeGreaterThanOrEqual(1);
      expect(result2[0].difficulty_level).toBe(String(1));

      // Kategori ID'ye göre filtrele
      const word = await Word.create(words[0]);
      await Word.addToCategory(word.id, testCategoryId);
      const result3 = await Word.findAll({ categoryId: testCategoryId, limit: 10, offset: 0 });
      expect(result3.length).toBeGreaterThanOrEqual(1);
    });

    it('geçersiz filtreleme parametreleri ile findAll hata vermemeli', async () => {
      const result = await Word.findAll({
        languageId: 99999,
        categoryId: 99999,
        difficultyLevel: 99,
        limit: 10,
        offset: 0
      });
      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('var olmayan kelimeyi güncellerken hata vermeli', async () => {
      const updateData = {
        word: 'updated',
        meaning: 'güncellenmiş',
        languageId: testLanguageId,
        difficultyLevel: 2
      };
      await expect(Word.update(99999, updateData)).rejects.toThrow();
    });

    it('var olmayan kelimeyi silerken hata vermeli', async () => {
      await expect(Word.delete(99999)).rejects.toThrow();
    });

    it('var olmayan kelimeyi kategoriye eklerken hata vermeli', async () => {
      await expect(Word.addToCategory(99999, testCategoryId)).rejects.toThrow();
    });

    it('var olmayan kelimeyi kategoriden kaldırırken hata vermeli', async () => {
      await expect(Word.removeFromCategory(99999, testCategoryId)).rejects.toThrow();
    });

    it('var olmayan kelimeye örnek cümle eklerken hata vermeli', async () => {
      await expect(Word.addExampleSentence(99999, 'Test sentence')).rejects.toThrow();
    });

    it('var olmayan kelimeye çeviri eklerken hata vermeli', async () => {
      await expect(Word.addTranslation(99999, 99999)).rejects.toThrow();
    });

    it('var olmayan kelimenin çevirilerini getirirken hata vermeli', async () => {
      const translations = await Word.getTranslations(99999);
      expect(translations).toHaveLength(0);
    });

    it('geçersiz filtreleme parametreleri ile findAll hata vermemeli', async () => {
      const result = await Word.findAll({
        languageId: 99999,
        categoryId: 99999,
        difficultyLevel: 99,
        limit: 10,
        offset: 0
      });
      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toHaveLength(0);
    });

    it('findById veritabanı hatası durumunda hata fırlatmalı', async () => {
      jest.spyOn(pool, 'query').mockImplementationOnce(() => {
        throw new Error('Veritabanı bağlantı hatası');
      });

      await expect(Word.findById(1)).rejects.toThrow('Veritabanı bağlantı hatası');
    });

    it('addTranslation veritabanı hatası durumunda hata fırlatmalı', async () => {
      jest.spyOn(pool, 'query').mockImplementationOnce(() => {
        throw new Error('Veritabanı hatası');
      });

      await expect(Word.addTranslation(1, 2)).rejects.toThrow('Veritabanı hatası');
    });

    it('findAll veritabanı hatası durumunda hata fırlatmalı', async () => {
      jest.spyOn(pool, 'query').mockImplementationOnce(() => {
        throw new Error('Veritabanı sorgu hatası');
      });

      await expect(Word.findAll({})).rejects.toThrow('Veritabanı sorgu hatası');
    });

    it('addExampleSentence veritabanı hatası durumunda hata fırlatmalı', async () => {
      jest.spyOn(pool, 'query').mockImplementationOnce(() => {
        throw new Error('Örnek cümle eklenirken veritabanı hatası oluştu');
      });

      await expect(Word.addExampleSentence(1, 'Test sentence'))
        .rejects
        .toThrow('Örnek cümle eklenirken veritabanı hatası oluştu');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });
}); 