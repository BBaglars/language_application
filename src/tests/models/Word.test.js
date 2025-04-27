const Word = require('../../models/Word');
const { pool } = require('../../db/db');

describe('Word Model (Gerçek Veritabanı)', () => {
    let createdWordId;

    afterAll(async () => {
        // Testte eklenen kelimeleri temizle
        if (createdWordId) {
            await pool.query('DELETE FROM words WHERE id = $1', [createdWordId]);
        }
    });

    it('should create a Word instance with correct properties', () => {
        const data = {
            id: 1,
            word: 'test',
            language_id: 1,
            difficulty_level: 'A1',
            letter_count: 4,
            created_by: 1,
            created_at: '2024-01-01',
            updated_at: '2024-01-02'
        };
        const word = new Word(data);
        expect(word.id).toBe(data.id);
        expect(word.word).toBe(data.word);
        expect(word.language_id).toBe(data.language_id);
        expect(word.difficulty_level).toBe(data.difficulty_level);
        expect(word.letter_count).toBe(data.letter_count);
        expect(word.created_by).toBe(data.created_by);
        expect(word.created_at).toBe(data.created_at);
    });

    it('should create a new word', async () => {
        // Önce gerekli foreign key kayıtlarını ekle
        const randomCode = 'xx' + Math.floor(Math.random() * 10000);
        const randomUid = 'testuid' + Math.floor(Math.random() * 100000);
        const randomEmail = `test${Math.floor(Math.random() * 100000)}@example.com`;
        const randomUsername = `testuser${Math.floor(Math.random() * 100000)}`;
        const langRes = await pool.query(`INSERT INTO languages (code, name) VALUES ('${randomCode}', 'TestLang') RETURNING id`);
        const userRes = await pool.query(`INSERT INTO users (firebase_uid, email, username) VALUES ('${randomUid}', '${randomEmail}', '${randomUsername}') RETURNING id`);
        const language_id = langRes.rows[0].id;
        const created_by = userRes.rows[0].id;
        const word = new Word({ word: 'testkelime', language_id, difficulty_level: 'A1', created_by });
        const newWord = await word.save();
        expect(newWord).toBeInstanceOf(Word);
        expect(newWord.word).toBe('testkelime');
        createdWordId = newWord.id;
        // Temizlik
        await pool.query('DELETE FROM users WHERE id = $1', [created_by]);
        await pool.query('DELETE FROM languages WHERE id = $1', [language_id]);
    });

    it('should find a word by id', async () => {
        if (!createdWordId) return; // Eğer kelime oluşturulamadıysa test atlanır
        const word = await Word.findById(createdWordId);
        expect(word).toBeInstanceOf(Word);
        expect(word.id).toBe(createdWordId);
    });

    it('should return null when word not found by id', async () => {
        const word = await Word.findById(999999);
        expect(word).toBeNull();
    });

    it('should find words by language', async () => {
        // Önce bir dil ve kullanıcı ekle
        const langRes = await pool.query("INSERT INTO languages (code, name) VALUES ('yy', 'TestLang2') RETURNING id");
        const userRes = await pool.query("INSERT INTO users (firebase_uid, email, username) VALUES ('testuid3', 'test3@example.com', 'testuser3') RETURNING id");
        const language_id = langRes.rows[0].id;
        const created_by = userRes.rows[0].id;
        const word = new Word({ word: 'testkelime2', language_id, difficulty_level: 'A2', created_by });
        const newWord = await word.save();
        const words = await Word.findByLanguage(language_id);
        expect(Array.isArray(words)).toBe(true);
        expect(words.some(w => w.word === 'testkelime2')).toBe(true);
        // Temizlik
        await pool.query('DELETE FROM words WHERE id = $1', [newWord.id]);
        await pool.query('DELETE FROM users WHERE id = $1', [created_by]);
        await pool.query('DELETE FROM languages WHERE id = $1', [language_id]);
    });

    it('should update an existing word', async () => {
        if (!createdWordId) return; // Eğer kelime oluşturulamadıysa test atlanır
        let word = await Word.findById(createdWordId);
        if (!word) return;
        word.word = 'updatedword';
        word.difficulty_level = 'B1';
        const updatedWord = await word.save();
        expect(updatedWord).toBeInstanceOf(Word);
        expect(updatedWord.word).toBe('updatedword');
        expect(updatedWord.difficulty_level).toBe('B1');
    });

    it('should delete a word', async () => {
        if (!createdWordId) return; // Eğer kelime oluşturulamadıysa test atlanır
        let word = await Word.findById(createdWordId);
        if (!word) return;
        await word.delete();
        const deleted = await Word.findById(createdWordId);
        expect(deleted).toBeNull();
        createdWordId = null;
    });
}); 