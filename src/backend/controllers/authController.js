const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      // Kullanıcıyı kontrol et
      const { rows: existingUsers } = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUsers.length > 0) {
        throw new ValidationError('Bu email adresi zaten kullanımda');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { rows } = await pool.query(
        'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username',
        [email, hashedPassword, name]
      );

      const user = rows[0];

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'gizli-anahtar',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email ve şifre gereklidir');
      }

      // Kullanıcıyı bul
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (rows.length === 0) {
        throw new UnauthorizedError('Geçersiz email veya şifre');
      }

      const user = rows[0];

      // Şifreyi kontrol et
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new UnauthorizedError('Geçersiz email veya şifre');
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          username: user.username
        },
        process.env.JWT_SECRET || 'gizli-anahtar',
        { expiresIn: '24h' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      });
    } catch (error) {
      console.error('Login hatası:', error);
      if (error instanceof ValidationError || error instanceof UnauthorizedError) {
        next(error);
      } else {
        next(new Error('Giriş işlemi sırasında bir hata oluştu'));
      }
    }
  }
}

module.exports = new AuthController(); 