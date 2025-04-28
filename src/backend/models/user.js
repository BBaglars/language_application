const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create({ username, email, password }) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
        [username, email, passwordHash]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT id, username, email, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, { username, email }) {
    try {
      const result = await pool.query(
        'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, created_at',
        [username, email, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updatePassword(id, newPassword) {
    try {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
        [passwordHash, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 