const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new ValidationError('Bu email adresi zaten kullanımda');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
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

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new UnauthorizedError('Geçersiz email veya şifre');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new UnauthorizedError('Geçersiz email veya şifre');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController(); 