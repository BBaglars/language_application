const WordTranslation = require('../../models/WordTranslation');
const Word = require('../../models/Word');
const Language = require('../../models/Language');
const User = require('../../models/User');
const { pool } = require('../../db/db');

describe('WordTranslation Model (Gerçek Veritabanı)', () => {
    let wordId, languageId, userId, translationId;

    beforeAll(async () => {
        // Gerekli foreign key kayıtlarını ekle
        const langRes = await pool.query("INSERT INTO languages (code, name) VALUES ('wtr', 'WordTransLang') RETURNING id");
        languageId = langRes.rows[0].id;
        const userRes = await pool.query("INSERT INTO users (firebase_uid, email, username) VALUES ('wtruid', 'wtr@example.com', 'wtruser') RETURNING id");
        userId = userRes.rows[0].id;
        const wordRes = await pool.query("INSERT INTO words (word, language_id, difficulty_level, created_by) VALUES ('wtrword', $1, 'A1', $2) RETURNING id", [languageId, userId]);
        wordId = wordRes.rows[0].id;
    });

    afterAll(async () => {
        if (translationId) {
            await pool.query('DELETE FROM word_translations WHERE id = $1', [translationId]);
        }
        await pool.query('DELETE FROM words WHERE id = $1', [wordId]);
        await pool.query('DELETE FROM languages WHERE id = $1', [languageId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('should create a WordTranslation instance with correct properties', () => {
        const data = {
            id: 1,
            word_id: 2,
            language_id: 3,
            translation: 'test',
            created_at: '2024-01-01'
        };
        const wt = new WordTranslation(data);
        expect(wt.id).toBe(data.id);
        expect(wt.word_id).toBe(data.word_id);
        expect(wt.language_id).toBe(data.language_id);
        expect(wt.translation).toBe(data.translation);
        expect(wt.created_at).toBe(data.created_at);
    });

    it('should create a new word translation', async () => {
        const wt = new WordTranslation({ word_id: wordId, language_id: languageId, translation: 'kelime' });
        const newWT = await wt.save();
        expect(newWT).toBeInstanceOf(WordTranslation);
        expect(newWT.word_id).toBe(wordId);
        expect(newWT.language_id).toBe(languageId);
        expect(newWT.translation).toBe('kelime');
        translationId = newWT.id;
    });

    it('should find by id', async () => {
        const wt = await WordTranslation.findById(translationId);
        expect(wt).toBeInstanceOf(WordTranslation);
        expect(wt.id).toBe(translationId);
    });

    it('should return null when not found by id', async () => {
        const wt = await WordTranslation.findById(999999);
        expect(wt).toBeNull();
    });

    it('should find by wordId', async () => {
        const list = await WordTranslation.findByWordId(wordId);
        expect(Array.isArray(list)).toBe(true);
        expect(list.some(wt => wt.id === translationId)).toBe(true);
    });

    it('should find by wordId and languageId', async () => {
        const wt = await WordTranslation.findByWordIdAndLanguageId(wordId, languageId);
        expect(wt).toBeInstanceOf(WordTranslation);
        expect(wt.word_id).toBe(wordId);
        expect(wt.language_id).toBe(languageId);
    });

    it('should update an existing word translation', async () => {
        let wt = await WordTranslation.findById(translationId);
        wt.translation = 'güncellendi';
        const updatedWT = await wt.save();
        expect(updatedWT).toBeInstanceOf(WordTranslation);
        expect(updatedWT.translation).toBe('güncellendi');
    });

    it('should delete a word translation', async () => {
        let wt = await WordTranslation.findById(translationId);
        await wt.delete();
        const deleted = await WordTranslation.findById(translationId);
        expect(deleted).toBeNull();
        translationId = null;
    });
}); 