const { pool } = require('../db/db');

class WordCategory {
    constructor(data) {
        this.word_id = data.word_id;
        this.category_id = data.category_id;
        this.created_at = data.created_at;
    }

    static async findByWordId(wordId) {
        const result = await pool.query('SELECT * FROM word_categories WHERE word_id = $1', [wordId]);
        return result.rows.map(row => new WordCategory(row));
    }

    static async findByCategoryId(categoryId) {
        const result = await pool.query('SELECT * FROM word_categories WHERE category_id = $1', [categoryId]);
        return result.rows.map(row => new WordCategory(row));
    }

    static async findByWordIdAndCategoryId(wordId, categoryId) {
        const result = await pool.query(
            'SELECT * FROM word_categories WHERE word_id = $1 AND category_id = $2',
            [wordId, categoryId]
        );
        return result.rows[0] ? new WordCategory(result.rows[0]) : null;
    }

    async save() {
        const result = await pool.query(
            'INSERT INTO word_categories (word_id, category_id) VALUES ($1, $2) RETURNING *',
            [this.word_id, this.category_id]
        );
        return new WordCategory(result.rows[0]);
    }

    async delete() {
        await pool.query(
            'DELETE FROM word_categories WHERE word_id = $1 AND category_id = $2',
            [this.word_id, this.category_id]
        );
    }

    static async getWordCountByCategory(categoryId) {
        const result = await pool.query(
            'SELECT COUNT(*) as word_count FROM word_categories WHERE category_id = $1',
            [categoryId]
        );
        return result.rows[0].word_count;
    }
}

module.exports = WordCategory; 