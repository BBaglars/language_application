const { pool } = require('../db/db');

class Language {
    constructor(data) {
        this.id = data.id;
        this.code = data.code;
        this.name = data.name;
        this.created_at = data.created_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM languages WHERE id = $1', [id]);
        return result.rows[0] ? new Language(result.rows[0]) : null;
    }

    static async findByCode(code) {
        const result = await pool.query('SELECT * FROM languages WHERE code = $1', [code]);
        return result.rows[0] ? new Language(result.rows[0]) : null;
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM languages ORDER BY name');
        return result.rows.map(row => new Language(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE languages SET code = $1, name = $2 WHERE id = $3 RETURNING *',
                [this.code, this.name, this.id]
            );
            return new Language(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO languages (code, name) VALUES ($1, $2) RETURNING *',
                [this.code, this.name]
            );
            return new Language(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM languages WHERE id = $1', [this.id]);
    }
}

module.exports = Language; 