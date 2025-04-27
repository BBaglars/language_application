const GameType = require('../../models/GameType');
const { pool } = require('../../db/db');

describe('GameType Model (Gerçek Veritabanı)', () => {
    let createdGameTypeId;

    afterAll(async () => {
        if (createdGameTypeId) {
            await pool.query('DELETE FROM game_types WHERE id = $1', [createdGameTypeId]);
        }
    });

    it('should create a GameType instance with correct properties', () => {
        const data = {
            id: 1,
            name: 'Word Quiz',
            description: 'Test your vocabulary knowledge',
            created_at: '2024-01-01'
        };
        const gameType = new GameType(data);
        expect(gameType.id).toBe(data.id);
        expect(gameType.name).toBe(data.name);
        expect(gameType.description).toBe(data.description);
        expect(gameType.created_at).toBe(data.created_at);
    });

    it('should create a new game type', async () => {
        const gameType = new GameType({ name: 'New Game', description: 'New description' });
        const newGameType = await gameType.save();
        expect(newGameType).toBeInstanceOf(GameType);
        expect(newGameType.name).toBe('New Game');
        createdGameTypeId = newGameType.id;
    });

    it('should find a game type by id', async () => {
        const gameType = await GameType.findById(createdGameTypeId);
        expect(gameType).toBeInstanceOf(GameType);
        expect(gameType.id).toBe(createdGameTypeId);
    });

    it('should return null when not found by id', async () => {
        const gameType = await GameType.findById(999999);
        expect(gameType).toBeNull();
    });

    it('should return an array of GameType instances', async () => {
        const gameTypes = await GameType.findAll();
        expect(Array.isArray(gameTypes)).toBe(true);
        if (gameTypes.length > 0) {
            expect(gameTypes[0]).toBeInstanceOf(GameType);
        }
    });

    it('should update an existing game type', async () => {
        let gameType = await GameType.findById(createdGameTypeId);
        gameType.name = 'Updated Game';
        gameType.description = 'Updated description';
        const updatedGameType = await gameType.save();
        expect(updatedGameType).toBeInstanceOf(GameType);
        expect(updatedGameType.name).toBe('Updated Game');
        expect(updatedGameType.description).toBe('Updated description');
    });

    it('should delete a game type', async () => {
        let gameType = await GameType.findById(createdGameTypeId);
        await gameType.delete();
        const deleted = await GameType.findById(createdGameTypeId);
        expect(deleted).toBeNull();
        createdGameTypeId = null;
    });
}); 