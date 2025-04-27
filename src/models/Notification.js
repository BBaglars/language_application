const { pool } = require('../db/db');

class Notification {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.title = data.title;
        this.message = data.message;
        this.type = data.type;
        this.is_read = data.is_read;
        this.created_at = data.created_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
        return result.rows[0] ? new Notification(result.rows[0]) : null;
    }

    static async findByUserId(userId) {
        const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows.map(row => new Notification(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE notifications SET user_id = $1, title = $2, message = $3, type = $4, is_read = $5 WHERE id = $6 RETURNING *',
                [this.user_id, this.title, this.message, this.type, this.is_read, this.id]
            );
            return new Notification(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [this.user_id, this.title, this.message, this.type, this.is_read]
            );
            return new Notification(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM notifications WHERE id = $1', [this.id]);
    }
}

module.exports = Notification; 