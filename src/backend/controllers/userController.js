const { pool } = require('../db');
const { AppError } = require('../utils/errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserController {
  static async createUser(req, res, next) {
    console.log('Register endpoint çağrıldı');
    try {
      const { username, email, password } = req.body;
      
      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const { rows } = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword]
      );
      
      console.log('Kullanıcı başarıyla eklendi:', rows[0]);
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Register endpoint hatası:', error);
      next(new AppError(error.message, 400));
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email ve şifre gereklidir', 400);
      }

      // Kullanıcıyı bul
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (rows.length === 0) {
        throw new AppError('Kullanıcı bulunamadı', 404);
      }

      const user = rows[0];

      // Şifreyi kontrol et
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError('Geçersiz şifre', 401);
      }

      // JWT token oluştur
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          username: user.username
        },
        process.env.JWT_SECRET || 'gizli-anahtar',
        { expiresIn: '1d' }
      );

      // Kullanıcı bilgilerini ve token'ı döndür
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error('Login hatası:', error);
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Giriş işlemi sırasında bir hata oluştu', 500));
      }
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
        updateQuery += `password_hash = $${paramCount}, `;
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