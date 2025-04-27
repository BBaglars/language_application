const { pool } = require('../db/db');

class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.parent_id = data.parent_id;
        this.created_by = data.created_by;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        return result.rows[0] ? new Category(result.rows[0]) : null;
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM categories ORDER BY name');
        return result.rows.map(row => new Category(row));
    }

    static async findByParentId(parentId) {
        const result = await pool.query('SELECT * FROM categories WHERE parent_id = $1 ORDER BY name', [parentId]);
        return result.rows.map(row => new Category(row));
    }

    async save() {
        if (this.id) {
            const result = await pool.query(
                'UPDATE categories SET name = $1, description = $2, parent_id = $3, created_by = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
                [this.name, this.description, this.parent_id, this.created_by, this.id]
            );
            return new Category(result.rows[0]);
        } else {
            const result = await pool.query(
                'INSERT INTO categories (name, description, parent_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
                [this.name, this.description, this.parent_id, this.created_by]
            );
            return new Category(result.rows[0]);
        }
    }

    async delete() {
        await pool.query('DELETE FROM categories WHERE id = $1', [this.id]);
    }
}

module.exports = Category; 