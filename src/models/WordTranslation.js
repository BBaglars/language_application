const { pool } = require('../db/db');

class WordTranslation {
    constructor(data) {
        this.id = data.id;
        this.word_id = data.word_id;
        this.language_id = data.language_id;
        this.translation = data.translation;
        this.created_at = data.created_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM word_translations WHERE id = $1', [id]);
        return result.rows[0] ? new WordTranslation(result.rows[0]) : null;
    }

    static async findByWordId(wordId) {
        const result = await pool.query('SELECT * FROM word_translations WHERE word_id = $1', [wordId]);
        return result.rows.map(row => new WordTranslation(row));
    }

    static async findByWordIdAndLanguageId(wordId, languageId) {
        const result = await pool.query(
            'SELECT * FROM word_translations WHERE word_id = $1 AND language_id = $2',
            [wordId, languageId]
        );
        return result.rows[0] ? new WordTranslation(result.rows[0]) : null;
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE word_translations SET translation = $1 WHERE id = $2 RETURNING *',
                [this.translation, this.id]
            );
            return new WordTranslation(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO word_translations (word_id, language_id, translation) VALUES ($1, $2, $3) RETURNING *',
                [this.word_id, this.language_id, this.translation]
            );
            return new WordTranslation(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM word_translations WHERE id = $1', [this.id]);
    }
}

module.exports = WordTranslation; 