const { pool } = require('../db/db');

class Game {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.game_type_id = data.game_type_id;
        this.language_id = data.language_id;
        this.category_id = data.category_id;
        this.started_at = data.started_at;
        this.completed_at = data.completed_at;
        this.score = data.score;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM game_sessions WHERE id = $1', [id]);
        return result.rows[0] ? new Game(result.rows[0]) : null;
    }

    static async findByUserId(userId, filters = {}) {
        let query = 'SELECT * FROM games WHERE user_id = $1';
        const params = [userId];
        let paramIndex = 2;

        if (filters.game_type_id) {
            query += ` AND game_type_id = $${paramIndex}`;
            params.push(filters.game_type_id);
            paramIndex++;
        }

        if (filters.start_date) {
            query += ` AND created_at >= $${paramIndex}`;
            params.push(filters.start_date);
            paramIndex++;
        }

        if (filters.end_date) {
            query += ` AND created_at <= $${paramIndex}`;
            params.push(filters.end_date);
            paramIndex++;
        }

        query += ' ORDER BY created_at DESC';
        
        if (filters.page && filters.limit) {
            const offset = (filters.page - 1) * filters.limit;
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(filters.limit, offset);
        }

        const result = await pool.query(query, params);
        return result.rows.map(row => new Game(row));
    }

    static async getHighScores(gameTypeId, limit = 10) {
        const result = await pool.query(
            `SELECT g.*, u.username 
             FROM games g 
             JOIN users u ON g.user_id = u.id 
             WHERE g.game_type_id = $1 
             ORDER BY g.score DESC 
             LIMIT $2`,
            [gameTypeId, limit]
        );
        return result.rows;
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE game_sessions SET score = $1, completed_at = $2 WHERE id = $3 RETURNING *',
                [this.score, this.completed_at, this.id]
            );
            return new Game(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO game_sessions (user_id, game_type_id, language_id, category_id, score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [this.user_id, this.game_type_id, this.language_id, this.category_id, this.score]
            );
            return new Game(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM game_sessions WHERE id = $1', [this.id]);
    }

    async saveAnswer(wordId, isCorrect) {
        await pool.query(
            'INSERT INTO game_answers (game_id, word_id, is_correct) VALUES ($1, $2, $3)',
            [this.id, wordId, isCorrect]
        );
    }

    async getAnswers() {
        const result = await pool.query(
            'SELECT * FROM game_answers WHERE game_id = $1',
            [this.id]
        );
        return result.rows;
    }
}

module.exports = Game; 