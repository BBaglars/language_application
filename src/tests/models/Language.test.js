const Language = require('../../models/Language');
const { pool } = require('../../db/db');

describe('Language Model (Gerçek Veritabanı)', () => {
    let createdLanguageId;

    afterAll(async () => {
        // Testte eklenen dilleri temizle
        if (createdLanguageId) {
            await pool.query('DELETE FROM languages WHERE id = $1', [createdLanguageId]);
        }
    });

    it('should create a Language instance with correct properties', () => {
        const data = {
            id: 1,
            code: 'en',
            name: 'English',
            created_at: '2024-01-01'
        };
        const language = new Language(data);
        expect(language.id).toBe(data.id);
        expect(language.code).toBe(data.code);
        expect(language.name).toBe(data.name);
        expect(language.created_at).toBe(data.created_at);
    });

    it('should create a new language', async () => {
        const language = new Language({ code: 'fr', name: 'French' });
        const newLanguage = await language.save();
        expect(newLanguage).toBeInstanceOf(Language);
        expect(newLanguage.code).toBe('fr');
        expect(newLanguage.name).toBe('French');
        createdLanguageId = newLanguage.id;
    });

    it('should find a language by id', async () => {
        const language = await Language.findById(createdLanguageId);
        expect(language).toBeInstanceOf(Language);
        expect(language.id).toBe(createdLanguageId);
    });

    it('should find a language by code', async () => {
        const language = await Language.findByCode('fr');
        expect(language).toBeInstanceOf(Language);
        expect(language.code).toBe('fr');
    });

    it('should return null when language not found by id', async () => {
        const language = await Language.findById(999999);
        expect(language).toBeNull();
    });

    it('should return null when language not found by code', async () => {
        const language = await Language.findByCode('notfound');
        expect(language).toBeNull();
    });

    it('should return an array of Language instances', async () => {
        const languages = await Language.findAll();
        expect(Array.isArray(languages)).toBe(true);
        if (languages.length > 0) {
            expect(languages[0]).toBeInstanceOf(Language);
        }
    });

    it('should update an existing language', async () => {
        let language = await Language.findById(createdLanguageId);
        language.name = 'French Updated';
        const updatedLanguage = await language.save();
        expect(updatedLanguage).toBeInstanceOf(Language);
        expect(updatedLanguage.name).toBe('French Updated');
    });

    it('should delete a language', async () => {
        let language = await Language.findById(createdLanguageId);
        await language.delete();
        const deleted = await Language.findById(createdLanguageId);
        expect(deleted).toBeNull();
        createdLanguageId = null;
    });
}); 