const { pool } = require('../config/database');

class Language {
  static async create({ code, name, nativeName }) {
    try {
      const result = await pool.query(
        'INSERT INTO languages (code, name, native_name) VALUES ($1, $2, $3) RETURNING *',
        [code, name, nativeName]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT l.*, COUNT(w.id) as word_count
         FROM languages l
         LEFT JOIN words w ON l.id = w.language_id
         WHERE l.id = $1
         GROUP BY l.id`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByCode(code) {
    try {
      const result = await pool.query(
        `SELECT l.*, COUNT(w.id) as word_count
         FROM languages l
         LEFT JOIN words w ON l.id = w.language_id
         WHERE l.code = $1
         GROUP BY l.id`,
        [code]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const result = await pool.query(
        `SELECT l.*, COUNT(w.id) as word_count
         FROM languages l
         LEFT JOIN words w ON l.id = w.language_id
         GROUP BY l.id
         ORDER BY l.name`
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, { code, name, nativeName }) {
    try {
      const result = await pool.query(
        'UPDATE languages SET code = $1, name = $2, native_name = $3 WHERE id = $4 RETURNING *',
        [code, name, nativeName, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM languages WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getWords(languageId, { limit = 10, offset = 0 }) {
    try {
      const result = await pool.query(
        `SELECT w.*, array_agg(DISTINCT c.name) as categories
         FROM languages l
         JOIN words w ON l.id = w.language_id
         LEFT JOIN word_categories wc ON w.id = wc.word_id
         LEFT JOIN categories c ON wc.category_id = c.id
         WHERE l.id = $1
         GROUP BY w.id
         ORDER BY w.created_at DESC
         LIMIT $2 OFFSET $3`,
        [languageId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Language; 