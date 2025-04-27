const { pool } = require('../db/db');

class Word {
    constructor(data) {
        this.id = data.id;
        this.word = data.word;
        this.language_id = data.language_id;
        this.difficulty_level = data.difficulty_level;
        this.letter_count = data.letter_count;
        this.created_by = data.created_by;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM words WHERE id = $1', [id]);
        return result.rows[0] ? new Word(result.rows[0]) : null;
    }

    static async findByLanguage(languageId) {
        const result = await pool.query('SELECT * FROM words WHERE language_id = $1', [languageId]);
        return result.rows.map(row => new Word(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE words SET word = $1, language_id = $2, difficulty_level = $3, created_by = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
                [this.word, this.language_id, this.difficulty_level, this.created_by, this.id]
            );
            return new Word(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO words (word, language_id, difficulty_level, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
                [this.word, this.language_id, this.difficulty_level, this.created_by]
            );
            return new Word(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM words WHERE id = $1', [this.id]);
    }
}

module.exports = Word; 