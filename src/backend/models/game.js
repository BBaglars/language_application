const { pool } = require('../config/database');

class Game {
  static async create({ name, description }) {
    try {
      const result = await pool.query(
        'INSERT INTO games (name, description) VALUES ($1, $2) RETURNING *',
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
        'SELECT * FROM games WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll({ limit = 10, offset = 0 }) {
    try {
      const result = await pool.query(
        'SELECT * FROM games ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, { name, description }) {
    try {
      const result = await pool.query(
        'UPDATE games SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM games WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Game; 