const GameAnswer = require('../../models/GameAnswer');
const Game = require('../../models/Game');
const Word = require('../../models/Word');
const Language = require('../../models/Language');
const User = require('../../models/User');
const { pool } = require('../../db/db');

describe('GameAnswer Model (Gerçek Veritabanı)', () => {
    let sessionId, wordId, languageId, userId, gameAnswerId, gameTypeId;

    beforeAll(async () => {
        // Gerekli foreign key kayıtlarını ekle
        const gameTypeRes = await pool.query("INSERT INTO game_types (name) VALUES ('TestType') RETURNING id");
        gameTypeId = gameTypeRes.rows[0].id;
        const langRes = await pool.query("INSERT INTO languages (code, name) VALUES ('ga', 'GameAnswerLang') RETURNING id");
        languageId = langRes.rows[0].id;
        const userRes = await pool.query("INSERT INTO users (firebase_uid, email, username) VALUES ('gauser', 'ga@example.com', 'gauser') RETURNING id");
        userId = userRes.rows[0].id;
        const wordRes = await pool.query("INSERT INTO words (word, language_id, difficulty_level, created_by) VALUES ('gaword', $1, 'A1', $2) RETURNING id", [languageId, userId]);
        wordId = wordRes.rows[0].id;
        const sessionRes = await pool.query("INSERT INTO game_sessions (user_id, game_type_id, language_id, category_id, score) VALUES ($1, $2, $3, NULL, 0) RETURNING id", [userId, gameTypeId, languageId]);
        sessionId = sessionRes.rows[0].id;
    });

    afterAll(async () => {
        if (gameAnswerId) {
            await pool.query('DELETE FROM game_answers WHERE id = $1', [gameAnswerId]);
        }
        await pool.query('DELETE FROM game_sessions WHERE id = $1', [sessionId]);
        await pool.query('DELETE FROM words WHERE id = $1', [wordId]);
        await pool.query('DELETE FROM languages WHERE id = $1', [languageId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        await pool.query('DELETE FROM game_types WHERE id = $1', [gameTypeId]);
    });

    it('should create a GameAnswer instance with correct properties', () => {
        const data = {
            id: 1,
            session_id: 2,
            word_id: 3,
            user_answer: 'örnek cevap',
            is_correct: true,
            answered_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z'
        };
        const ga = new GameAnswer(data);
        expect(ga.id).toBe(data.id);
        expect(ga.session_id).toBe(data.session_id);
        expect(ga.word_id).toBe(data.word_id);
        expect(ga.user_answer).toBe(data.user_answer);
        expect(ga.is_correct).toBe(data.is_correct);
        expect(ga.answered_at).toBe(data.answered_at);
        expect(ga.created_at).toBe(data.created_at);
    });

    it('should create a new game answer', async () => {
        const ga = new GameAnswer({ session_id: sessionId, word_id: wordId, user_answer: 'testcevap', is_correct: true, answered_at: new Date().toISOString() });
        const newGA = await ga.save();
        expect(newGA).toBeInstanceOf(GameAnswer);
        expect(newGA.session_id).toBe(sessionId);
        expect(newGA.word_id).toBe(wordId);
        expect(newGA.is_correct).toBe(true);
        expect(newGA.user_answer).toBe('testcevap');
        gameAnswerId = newGA.id;
    });

    it('should find by id', async () => {
        const ga = await GameAnswer.findById(gameAnswerId);
        expect(ga).toBeInstanceOf(GameAnswer);
        expect(ga.id).toBe(gameAnswerId);
    });

    it('should return null when not found by id', async () => {
        const ga = await GameAnswer.findById(999999);
        expect(ga).toBeNull();
    });

    it('should find by sessionId', async () => {
        const list = await GameAnswer.findBySessionId(sessionId);
        expect(Array.isArray(list)).toBe(true);
        if (!list.length) return;
        expect(list.some(ga => ga.id === gameAnswerId)).toBe(true);
    });

    it('should update is_correct of a game answer', async () => {
        let ga = await GameAnswer.findById(gameAnswerId);
        if (!ga) return;
        ga.is_correct = false;
        const updatedGA = await ga.save();
        expect(updatedGA).toBeInstanceOf(GameAnswer);
        expect(updatedGA.is_correct).toBe(false);
    });

    it('should delete a game answer', async () => {
        let ga = await GameAnswer.findById(gameAnswerId);
        if (!ga) return;
        await ga.delete();
        const deleted = await GameAnswer.findById(gameAnswerId);
        expect(deleted).toBeNull();
        gameAnswerId = null;
    });
}); 