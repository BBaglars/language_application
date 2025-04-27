const { pool } = require('../db/db');

class Admin {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.role = data.role;
        this.permissions = data.permissions;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM admins WHERE id = $1', [id]);
        return result.rows[0] ? new Admin(result.rows[0]) : null;
    }

    static async findByUserId(userId) {
        const result = await pool.query('SELECT * FROM admins WHERE user_id = $1', [userId]);
        return result.rows[0] ? new Admin(result.rows[0]) : null;
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM admins ORDER BY id');
        return result.rows.map(row => new Admin(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE admins SET user_id = $1, role = $2, permissions = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
                [this.user_id, this.role, this.permissions, this.id]
            );
            return new Admin(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO admins (user_id, role, permissions) VALUES ($1, $2, $3) RETURNING *',
                [this.user_id, this.role, this.permissions]
            );
            return new Admin(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM admins WHERE id = $1', [this.id]);
    }
}

module.exports = Admin; 