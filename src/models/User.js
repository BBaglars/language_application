const { pool } = require('../db/db');

class User {
    constructor(data) {
        this.id = data.id;
        this.firebase_uid = data.firebase_uid;
        this.email = data.email;
        this.username = data.username;
        this.full_name = data.full_name;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] ? new User(result.rows[0]) : null;
    }

    static async findByFirebaseUid(uid) {
        const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
        return result.rows[0] ? new User(result.rows[0]) : null;
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE users SET email = $1, username = $2, full_name = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
                [this.email, this.username, this.full_name, this.id]
            );
            return new User(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO users (firebase_uid, email, username, full_name) VALUES ($1, $2, $3, $4) RETURNING *',
                [this.firebase_uid, this.email, this.username, this.full_name]
            );
            return new User(result.rows[0]);
        }
    }
}

module.exports = User; 