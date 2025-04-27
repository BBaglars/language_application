const { pool } = require('../db/db');

class GameType {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.created_at = data.created_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM game_types WHERE id = $1', [id]);
        return result.rows[0] ? new GameType(result.rows[0]) : null;
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM game_types ORDER BY name');
        return result.rows.map(row => new GameType(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE game_types SET name = $1, description = $2 WHERE id = $3 RETURNING *',
                [this.name, this.description, this.id]
            );
            return new GameType(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO game_types (name, description) VALUES ($1, $2) RETURNING *',
                [this.name, this.description]
            );
            return new GameType(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM game_types WHERE id = $1', [this.id]);
    }
}

module.exports = GameType; 