const Game = require('../../models/Game');
const { pool } = require('../../db/db');

describe('Game Model (Gerçek Veritabanı)', () => {
    let createdGameSessionId;
    let userId, gameTypeId, languageId, categoryId;

    beforeAll(async () => {
        // Gerekli foreign key kayıtlarını ekle
        const userRes = await pool.query("INSERT INTO users (firebase_uid, email, username) VALUES ('gameuid', 'game@example.com', 'gameuser') RETURNING id");
        userId = userRes.rows[0].id;
        const langRes = await pool.query("INSERT INTO languages (code, name) VALUES ('gm', 'GameLang') RETURNING id");
        languageId = langRes.rows[0].id;
        const typeRes = await pool.query("INSERT INTO game_types (name, description) VALUES ('TestType', 'desc') RETURNING id");
        gameTypeId = typeRes.rows[0].id;
        const catRes = await pool.query("INSERT INTO categories (name, created_by) VALUES ('GameCat', $1) RETURNING id", [userId]);
        categoryId = catRes.rows[0].id;
    });

    afterAll(async () => {
        // Testte eklenen oturum ve foreign key kayıtlarını temizle
        if (createdGameSessionId) {
            await pool.query('DELETE FROM game_sessions WHERE id = $1', [createdGameSessionId]);
        }
        await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
        await pool.query('DELETE FROM game_types WHERE id = $1', [gameTypeId]);
        await pool.query('DELETE FROM languages WHERE id = $1', [languageId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('should create a Game instance with correct properties', () => {
        const data = {
            id: 1,
            user_id: 1,
            game_type_id: 1,
            language_id: 1,
            category_id: 1,
            started_at: '2024-01-01',
            completed_at: null,
            score: 100
        };
        const game = new Game(data);
        expect(game.id).toBe(data.id);
        expect(game.user_id).toBe(data.user_id);
        expect(game.game_type_id).toBe(data.game_type_id);
        expect(game.language_id).toBe(data.language_id);
        expect(game.category_id).toBe(data.category_id);
        expect(game.started_at).toBe(data.started_at);
        expect(game.completed_at).toBe(data.completed_at);
        expect(game.score).toBe(data.score);
    });

    it('should create a new game session', async () => {
        const game = new Game({
            user_id: userId,
            game_type_id: gameTypeId,
            language_id: languageId,
            category_id: categoryId,
            score: 50
        });
        const newSession = await game.save();
        expect(newSession).toBeInstanceOf(Game);
        expect(newSession.user_id).toBe(userId);
        createdGameSessionId = newSession.id;
    });

    it('should find a game session by id', async () => {
        const game = await Game.findById(createdGameSessionId);
        expect(game).toBeInstanceOf(Game);
        expect(game.id).toBe(createdGameSessionId);
    });

    it('should return null when game session not found by id', async () => {
        const game = await Game.findById(999999);
        expect(game).toBeNull();
    });

    it('should update an existing game session', async () => {
        let game = await Game.findById(createdGameSessionId);
        game.score = 200;
        const updatedGame = await game.save();
        expect(updatedGame).toBeInstanceOf(Game);
        expect(updatedGame.score).toBe(200);
    });

    it('should delete a game session', async () => {
        let game = await Game.findById(createdGameSessionId);
        await game.delete();
        const deleted = await Game.findById(createdGameSessionId);
        expect(deleted).toBeNull();
        createdGameSessionId = null;
    });
}); 