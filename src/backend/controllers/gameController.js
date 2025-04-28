const { pool } = require('../db');
const { AppError } = require('../utils/errors');

class GameController {
  static async getAllGames(req, res, next) {
    try {
      const { rows } = await pool.query(
        `SELECT g.*, 
         json_build_object(
           'id', u.id,
           'username', u.username,
           'email', u.email
         ) as user
         FROM games g
         LEFT JOIN users u ON g.user_id = u.id`
      );
      res.json(rows);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  static async getGameById(req, res, next) {
    try {
      const { rows } = await pool.query(
        `SELECT g.*, 
         json_build_object(
           'id', u.id,
           'username', u.username,
           'email', u.email
         ) as user
         FROM games g
         LEFT JOIN users u ON g.user_id = u.id
         WHERE g.id = $1`,
        [req.params.id]
      );

      if (rows.length === 0) {
        throw new AppError('Oyun bulunamadı', 404);
      }

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async createGame(req, res, next) {
    try {
      const { userId, gameType, score, duration } = req.body;

      const { rows } = await pool.query(
        'INSERT INTO games (user_id, game_type, score, duration) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, gameType, score, duration]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  static async updateGame(req, res, next) {
    try {
      const { gameType, score, duration } = req.body;
      const { rows } = await pool.query(
        'UPDATE games SET game_type = $1, score = $2, duration = $3 WHERE id = $4 RETURNING *',
        [gameType, score, duration, req.params.id]
      );

      if (rows.length === 0) {
        throw new AppError('Oyun bulunamadı', 404);
      }

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async deleteGame(req, res, next) {
    try {
      const { rows } = await pool.query(
        'DELETE FROM games WHERE id = $1 RETURNING *',
        [req.params.id]
      );

      if (rows.length === 0) {
        throw new AppError('Oyun bulunamadı', 404);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getUserGames(req, res, next) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM games WHERE user_id = $1 ORDER BY created_at DESC',
        [req.params.userId]
      );

      res.json(rows);
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = GameController; 