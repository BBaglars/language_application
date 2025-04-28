const { pool } = require('../config/database');

class Category {
  static async create({ name, description }) {
    try {
      const result = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT c.*, 
         array_agg(DISTINCT w.word) as words
         FROM categories c
         LEFT JOIN word_categories wc ON c.id = wc.category_id
         LEFT JOIN words w ON wc.word_id = w.id
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const result = await pool.query(
        `SELECT c.*, 
         COUNT(DISTINCT w.id) as word_count
         FROM categories c
         LEFT JOIN word_categories wc ON c.id = wc.category_id
         LEFT JOIN words w ON wc.word_id = w.id
         GROUP BY c.id
         ORDER BY c.name`
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, { name, description }) {
    try {
      const result = await pool.query(
        'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getWords(categoryId, { limit = 10, offset = 0 }) {
    try {
      const result = await pool.query(
        `SELECT w.*, l.code as language_code, l.name as language_name
         FROM categories c
         JOIN word_categories wc ON c.id = wc.category_id
         JOIN words w ON wc.word_id = w.id
         JOIN languages l ON w.language_id = l.id
         WHERE c.id = $1
         ORDER BY w.created_at DESC
         LIMIT $2 OFFSET $3`,
        [categoryId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Category; 