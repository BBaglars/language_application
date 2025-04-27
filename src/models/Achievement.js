const { pool } = require('../db/db');

class Achievement {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.icon_url = data.icon_url;
        this.created_at = data.created_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM achievements WHERE id = $1', [id]);
        return result.rows[0] ? new Achievement(result.rows[0]) : null;
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM achievements ORDER BY id');
        return result.rows.map(row => new Achievement(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE achievements SET name = $1, description = $2, icon_url = $3 WHERE id = $4 RETURNING *',
                [this.name, this.description, this.icon_url, this.id]
            );
            return new Achievement(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO achievements (name, description, icon_url) VALUES ($1, $2, $3) RETURNING *',
                [this.name, this.description, this.icon_url]
            );
            return new Achievement(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM achievements WHERE id = $1', [this.id]);
    }
}

module.exports = Achievement; 