const { pool } = require('../db/db');

class GameSession {
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
        return result.rows[0] ? new GameSession(result.rows[0]) : null;
    }

    static async findByUserId(userId) {
        const result = await pool.query('SELECT * FROM game_sessions WHERE user_id = $1', [userId]);
        return result.rows.map(row => new GameSession(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE game_sessions SET user_id = $1, game_type_id = $2, language_id = $3, category_id = $4, started_at = $5, completed_at = $6, score = $7 WHERE id = $8 RETURNING *',
                [this.user_id, this.game_type_id, this.language_id, this.category_id, this.started_at, this.completed_at, this.score, this.id]
            );
            return new GameSession(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO game_sessions (user_id, game_type_id, language_id, category_id, started_at, completed_at, score) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [this.user_id, this.game_type_id, this.language_id, this.category_id, this.started_at, this.completed_at, this.score]
            );
            return new GameSession(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM game_sessions WHERE id = $1', [this.id]);
    }
}

module.exports = GameSession; 