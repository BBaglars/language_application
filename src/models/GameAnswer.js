const { pool } = require('../db/db');

class GameAnswer {
    constructor(data) {
        this.id = data.id;
        this.session_id = data.session_id;
        this.word_id = data.word_id;
        this.user_answer = data.user_answer;
        this.is_correct = data.is_correct;
        this.answered_at = data.answered_at;
        this.created_at = data.created_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM game_answers WHERE id = $1', [id]);
        return result.rows[0] ? new GameAnswer(result.rows[0]) : null;
    }

    static async findByGameId(gameId) {
        const result = await pool.query('SELECT * FROM game_answers WHERE game_id = $1', [gameId]);
        return result.rows.map(row => new GameAnswer(row));
    }

    static async getGameStats(gameId) {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_answers,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                AVG(EXTRACT(EPOCH FROM (answer_time - created_at))) as average_answer_time
            FROM game_answers
            WHERE game_id = $1
        `, [gameId]);
        return result.rows[0];
    }

    static async findBySessionId(sessionId) {
        const result = await pool.query('SELECT * FROM game_answers WHERE session_id = $1', [sessionId]);
        return result.rows.map(row => new GameAnswer(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE game_answers SET session_id = $1, word_id = $2, user_answer = $3, is_correct = $4, answered_at = $5 WHERE id = $6 RETURNING *',
                [this.session_id, this.word_id, this.user_answer, this.is_correct, this.answered_at, this.id]
            );
            return new GameAnswer(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO game_answers (session_id, word_id, user_answer, is_correct, answered_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [this.session_id, this.word_id, this.user_answer, this.is_correct, this.answered_at]
            );
            return new GameAnswer(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM game_answers WHERE id = $1', [this.id]);
    }
}

module.exports = GameAnswer; 