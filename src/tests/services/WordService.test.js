const { pool } = require('../../db/db');
const WordService = require('../../services/WordService');

// Sadece gerçek veritabanı ile çalışan testler

describe('WordService (Gerçek Veritabanı)', () => {
    beforeAll(async () => {
        // Test kullanıcı ve dilini ekle
        await pool.query("INSERT INTO users (id, firebase_uid, email, username) VALUES (1, 'testuid', 'test@example.com', 'testuser') ON CONFLICT DO NOTHING");
        await pool.query("INSERT INTO languages (id, code, name) VALUES (1, 'en', 'English') ON CONFLICT DO NOTHING");
    });

    afterAll(async () => {
        // Testte eklenen kelimeleri ve kullanıcı/dili temizle
        await pool.query("DELETE FROM words WHERE created_by = 1");
        await pool.query("DELETE FROM users WHERE id = 1");
        await pool.query("DELETE FROM languages WHERE id = 1");
        // await pool.end(); // Eğer başka bir yerde çağrılıyorsa yoruma al
    });

    let createdWordId;

    it('should create a new word successfully', async () => {
        const wordData = {
            word: 'testword',
            language_id: 1,
            difficulty_level: 'A1',
            created_by: 1
        };
        createdWordId = await WordService.createWord(wordData);
        expect(createdWordId).toBeGreaterThan(0);
    });

    it('should return word by id', async () => {
        const result = await WordService.getWordById(createdWordId);
        expect(result).toBeDefined();
        expect(result.id).toBe(createdWordId);
    });

    it('should update word successfully', async () => {
        // difficulty_level zorunlu olduğu için hem word hem difficulty_level gönderiyoruz
        const wordData = { word: 'updatedword', difficulty_level: 'A1' };
        const result = await WordService.updateWord(createdWordId, wordData);
        expect(result).toBe(true);
        // Kontrol: güncellenen kelimeyi çek
        const updated = await WordService.getWordById(createdWordId);
        expect(updated.word).toBe('updatedword');
        expect(updated.difficulty_level).toBe('A1');
    });

    it('should return false when word not found (update)', async () => {
        // difficulty_level zorunlu olduğu için ekliyoruz
        const result = await WordService.updateWord(999999, { word: 'notfound', difficulty_level: 'A1' });
        expect(result).toBe(false);
    });

    it('should return words by language with pagination', async () => {
        const filters = { page: 1, limit: 10 };
        const result = await WordService.getWordsByLanguage(1, filters);
        expect(Array.isArray(result.words)).toBe(true);
        expect(typeof result.total).toBe('number');
    });

    it('should delete word successfully', async () => {
        const result = await WordService.deleteWord(createdWordId);
        expect(result).toBe(true);
        // Kontrol: silinen kelimeyi çek
        const deleted = await WordService.getWordById(createdWordId);
        expect(deleted).toBeNull();
    });

    it('should return false when word not found (delete)', async () => {
        const result = await WordService.deleteWord(999999);
        expect(result).toBe(false);
    });
}); 