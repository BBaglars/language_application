const { pool } = require('../db/db');

class UserWordLevel {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.word_id = data.word_id;
        this.mastery_level = data.mastery_level;
        this.next_review_date = data.next_review_date;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM user_word_levels WHERE id = $1', [id]);
        return result.rows[0] ? new UserWordLevel(result.rows[0]) : null;
    }

    static async findByUserId(userId) {
        const result = await pool.query('SELECT * FROM user_word_levels WHERE user_id = $1', [userId]);
        return result.rows.map(row => new UserWordLevel(row));
    }

    static async findByWordId(wordId) {
        const result = await pool.query('SELECT * FROM user_word_levels WHERE word_id = $1', [wordId]);
        return result.rows.map(row => new UserWordLevel(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE user_word_levels SET user_id = $1, word_id = $2, mastery_level = $3, next_review_date = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
                [this.user_id, this.word_id, this.mastery_level, this.next_review_date, this.id]
            );
            return new UserWordLevel(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO user_word_levels (user_id, word_id, mastery_level, next_review_date) VALUES ($1, $2, $3, $4) RETURNING *',
                [this.user_id, this.word_id, this.mastery_level, this.next_review_date]
            );
            return new UserWordLevel(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM user_word_levels WHERE id = $1', [this.id]);
    }

    static async getProgressStats(userId) {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_words,
                SUM(CASE WHEN mastery_level = 'C1' THEN 1 ELSE 0 END) as mastered_words,
                AVG(CASE 
                    WHEN mastery_level = 'A1' THEN 1
                    WHEN mastery_level = 'A2' THEN 2
                    WHEN mastery_level = 'B1' THEN 3
                    WHEN mastery_level = 'B2' THEN 4
                    WHEN mastery_level = 'C1' THEN 5
                    ELSE NULL END) as average_level,
                MAX(next_review_date) as last_practice_date
            FROM user_word_levels
            WHERE user_id = $1
        `, [userId]);
        return result.rows[0];
    }
}

module.exports = UserWordLevel; 