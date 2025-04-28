const { pool } = require('../db');
const { AppError } = require('../utils/errors');

class UserController {
  static async createUser(req, res, next) {
    try {
      const { username, email, password } = req.body;
      
      const { rows } = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, password]
      );
      
      res.status(201).json(rows[0]);
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { rows } = await pool.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [req.params.id]
      );
      
      if (rows.length === 0) {
        throw new AppError('Kullanıcı bulunamadı', 404);
      }
      
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { username, email, password } = req.body;
      let updateQuery = 'UPDATE users SET ';
      const queryParams = [];
      let paramCount = 1;

      if (username) {
        updateQuery += `username = $${paramCount}, `;
        queryParams.push(username);
        paramCount++;
      }

      if (email) {
        updateQuery += `email = $${paramCount}, `;
        queryParams.push(email);
        paramCount++;
      }

      if (password) {
        updateQuery += `password = $${paramCount}, `;
        queryParams.push(password);
        paramCount++;
      }

      // Son virgülü kaldır
      updateQuery = updateQuery.slice(0, -2);
      
      updateQuery += ` WHERE id = $${paramCount} RETURNING id, username, email`;
      queryParams.push(req.params.id);

      const { rows } = await pool.query(updateQuery, queryParams);
      
      if (rows.length === 0) {
        throw new AppError('Kullanıcı bulunamadı', 404);
      }
      
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { rows } = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [req.params.id]
      );
      
      if (rows.length === 0) {
        throw new AppError('Kullanıcı bulunamadı', 404);
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getUserWordProgress(req, res, next) {
    try {
      const { rows } = await pool.query(
        `SELECT w.*, up.progress_level, up.last_reviewed
         FROM user_word_progress up
         JOIN words w ON up.word_id = w.id
         WHERE up.user_id = $1`,
        [req.params.id]
      );
      
      res.json(rows);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  static async updateWordProgress(req, res, next) {
    try {
      const { wordId, progressLevel } = req.body;
      
      const { rows } = await pool.query(
        `INSERT INTO user_word_progress (user_id, word_id, progress_level, last_reviewed)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, word_id)
         DO UPDATE SET progress_level = $3, last_reviewed = NOW()
         RETURNING *`,
        [req.params.id, wordId, progressLevel]
      );
      
      res.json(rows[0]);
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }
}

module.exports = UserController; 