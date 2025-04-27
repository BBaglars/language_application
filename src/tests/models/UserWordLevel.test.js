const UserWordLevel = require('../../models/UserWordLevel');
const User = require('../../models/User');
const Word = require('../../models/Word');
const Language = require('../../models/Language');
const { pool } = require('../../db/db');

describe('UserWordLevel Model (Gerçek Veritabanı)', () => {
    let userId, wordId, languageId, userWordLevelId;

    beforeAll(async () => {
        // Gerekli foreign key kayıtlarını ekle
        const langRes = await pool.query("INSERT INTO languages (code, name) VALUES ('uwl', 'UserWordLevelLang') RETURNING id");
        languageId = langRes.rows[0].id;
        const userRes = await pool.query("INSERT INTO users (firebase_uid, email, username) VALUES ('uwluid', 'uwl@example.com', 'uwluser') RETURNING id");
        userId = userRes.rows[0].id;
        const wordRes = await pool.query("INSERT INTO words (word, language_id, difficulty_level, created_by) VALUES ('uwlword', $1, 'A1', $2) RETURNING id", [languageId, userId]);
        wordId = wordRes.rows[0].id;
    });

    afterAll(async () => {
        if (userWordLevelId) {
            await pool.query('DELETE FROM user_word_levels WHERE id = $1', [userWordLevelId]);
        }
        await pool.query('DELETE FROM words WHERE id = $1', [wordId]);
        await pool.query('DELETE FROM languages WHERE id = $1', [languageId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('should create a UserWordLevel instance with correct properties', () => {
        const data = {
            id: 1,
            user_id: 2,
            word_id: 3,
            mastery_level: 'A2',
            next_review_date: '2024-01-10',
            created_at: '2024-01-01',
            updated_at: '2024-01-02'
        };
        const uwl = new UserWordLevel(data);
        expect(uwl.id).toBe(data.id);
        expect(uwl.user_id).toBe(data.user_id);
        expect(uwl.word_id).toBe(data.word_id);
        expect(uwl.mastery_level).toBe(data.mastery_level);
        expect(uwl.next_review_date).toBe(data.next_review_date);
        expect(uwl.created_at).toBe(data.created_at);
        expect(uwl.updated_at).toBe(data.updated_at);
    });

    it('should create a new user word level', async () => {
        const uwl = new UserWordLevel({ user_id: userId, word_id: wordId, mastery_level: 'A1', next_review_date: '2024-01-10' });
        const newUwl = await uwl.save();
        expect(newUwl).toBeInstanceOf(UserWordLevel);
        expect(newUwl.user_id).toBe(userId);
        expect(newUwl.word_id).toBe(wordId);
        expect(newUwl.mastery_level).toBe('A1');
        userWordLevelId = newUwl.id;
    });

    it('should find by id', async () => {
        const uwl = await UserWordLevel.findById(userWordLevelId);
        expect(uwl).toBeInstanceOf(UserWordLevel);
        expect(uwl.id).toBe(userWordLevelId);
    });

    it('should return null when not found by id', async () => {
        const uwl = await UserWordLevel.findById(999999);
        expect(uwl).toBeNull();
    });

    it('should find by userId', async () => {
        const list = await UserWordLevel.findByUserId(userId);
        expect(Array.isArray(list)).toBe(true);
        expect(list.some(u => u.id === userWordLevelId)).toBe(true);
    });

    it('should find by wordId', async () => {
        const list = await UserWordLevel.findByWordId(wordId);
        expect(Array.isArray(list)).toBe(true);
        expect(list.some(u => u.id === userWordLevelId)).toBe(true);
    });

    it('should update an existing user word level', async () => {
        let uwl = await UserWordLevel.findById(userWordLevelId);
        uwl.mastery_level = 'C1';
        uwl.next_review_date = '2024-01-20';
        const updatedUwl = await uwl.save();
        expect(updatedUwl).toBeInstanceOf(UserWordLevel);
        expect(updatedUwl.mastery_level).toBe('C1');
        const expected = new Date('2024-01-20T00:00:00Z');
        const actual = new Date(updatedUwl.next_review_date);
        const dayDiff = Math.abs(actual.getUTCDate() - expected.getUTCDate());
        expect(dayDiff).toBeLessThanOrEqual(1);
        expect(actual.getUTCFullYear()).toBe(expected.getUTCFullYear());
        expect(actual.getUTCMonth()).toBe(expected.getUTCMonth());
    });

    it('should get progress stats', async () => {
        const stats = await UserWordLevel.getProgressStats(userId);
        expect(Number(stats.total_words)).toBeGreaterThanOrEqual(1);
        expect(Number(stats.average_level)).toBeGreaterThanOrEqual(1);
    });

    it('should delete a user word level', async () => {
        let uwl = await UserWordLevel.findById(userWordLevelId);
        await uwl.delete();
        const deleted = await UserWordLevel.findById(userWordLevelId);
        expect(deleted).toBeNull();
        userWordLevelId = null;
    });
}); 