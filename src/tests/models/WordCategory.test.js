const WordCategory = require('../../models/WordCategory');
const Word = require('../../models/Word');
const Category = require('../../models/Category');
const Language = require('../../models/Language');
const User = require('../../models/User');
const { pool } = require('../../db/db');

describe('WordCategory Model (Gerçek Veritabanı)', () => {
    let wordId, categoryId, languageId, userId;

    beforeAll(async () => {
        // Gerekli foreign key kayıtlarını ekle
        const langRes = await pool.query("INSERT INTO languages (code, name) VALUES ('wc', 'WordCatLang') RETURNING id");
        languageId = langRes.rows[0].id;
        const userRes = await pool.query("INSERT INTO users (firebase_uid, email, username) VALUES ('wcuid', 'wc@example.com', 'wcuser') RETURNING id");
        userId = userRes.rows[0].id;
        const wordRes = await pool.query("INSERT INTO words (word, language_id, difficulty_level, created_by) VALUES ('wordcatword', $1, 'A1', $2) RETURNING id", [languageId, userId]);
        wordId = wordRes.rows[0].id;
        const catRes = await pool.query("INSERT INTO categories (name, created_by) VALUES ('WordCat', $1) RETURNING id", [userId]);
        categoryId = catRes.rows[0].id;
    });

    afterAll(async () => {
        await pool.query('DELETE FROM word_categories WHERE word_id = $1 AND category_id = $2', [wordId, categoryId]);
        await pool.query('DELETE FROM words WHERE id = $1', [wordId]);
        await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
        await pool.query('DELETE FROM languages WHERE id = $1', [languageId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('should create a WordCategory instance with correct properties', () => {
        const data = { word_id: 1, category_id: 2, created_at: '2024-01-01' };
        const wc = new WordCategory(data);
        expect(wc.word_id).toBe(data.word_id);
        expect(wc.category_id).toBe(data.category_id);
        expect(wc.created_at).toBe(data.created_at);
    });

    it('should create a new word-category relation', async () => {
        const wc = new WordCategory({ word_id: wordId, category_id: categoryId });
        const newWC = await wc.save();
        expect(newWC).toBeInstanceOf(WordCategory);
        expect(newWC.word_id).toBe(wordId);
        expect(newWC.category_id).toBe(categoryId);
    });

    it('should find by wordId', async () => {
        const list = await WordCategory.findByWordId(wordId);
        expect(Array.isArray(list)).toBe(true);
        expect(list.some(wc => wc.category_id === categoryId)).toBe(true);
    });

    it('should find by categoryId', async () => {
        const list = await WordCategory.findByCategoryId(categoryId);
        expect(Array.isArray(list)).toBe(true);
        expect(list.some(wc => wc.word_id === wordId)).toBe(true);
    });

    it('should find by wordId and categoryId', async () => {
        const wc = await WordCategory.findByWordIdAndCategoryId(wordId, categoryId);
        expect(wc).toBeInstanceOf(WordCategory);
        expect(wc.word_id).toBe(wordId);
        expect(wc.category_id).toBe(categoryId);
    });

    it('should return null if not found by wordId and categoryId', async () => {
        const wc = await WordCategory.findByWordIdAndCategoryId(999999, 999999);
        expect(wc).toBeNull();
    });

    it('should get word count by category', async () => {
        const count = await WordCategory.getWordCountByCategory(categoryId);
        expect(Number(count)).toBeGreaterThanOrEqual(1);
    });

    it('should delete a word-category relation', async () => {
        const wc = new WordCategory({ word_id: wordId, category_id: categoryId });
        await wc.delete();
        const deleted = await WordCategory.findByWordIdAndCategoryId(wordId, categoryId);
        expect(deleted).toBeNull();
    });
}); 