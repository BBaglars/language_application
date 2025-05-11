const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class UserController {
  // Kullanıcı kaydı
  static async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      // Email kontrolü
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return next(new AppError('Bu email adresi zaten kullanılıyor', 400));
      }

      // Şifre hashleme
      const hashedPassword = await bcrypt.hash(password, 12);

      // Kullanıcı oluşturma
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      // JWT token oluşturma
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        status: 'success',
        token,
        data: {
          user
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kullanıcı girişi
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Kullanıcı kontrolü
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return next(new AppError('Geçersiz email veya şifre', 401));
      }

      // Şifre kontrolü
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return next(new AppError('Geçersiz email veya şifre', 401));
      }

      // JWT token oluşturma
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        status: 'success',
        token,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kullanıcı profili
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      if (!user) {
        return next(new AppError('Kullanıcı bulunamadı', 404));
      }

      res.json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Profil güncelleme
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, email, currentPassword, newPassword } = req.body;

      // Kullanıcı kontrolü
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return next(new AppError('Kullanıcı bulunamadı', 404));
      }

      // Email değişikliği varsa kontrol et
      if (email && email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          return next(new AppError('Bu email adresi zaten kullanılıyor', 400));
        }
      }

      // Şifre değişikliği varsa kontrol et
      let hashedPassword = user.password;
      if (currentPassword && newPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
          return next(new AppError('Mevcut şifre yanlış', 401));
        }

        hashedPassword = await bcrypt.hash(newPassword, 12);
      }

      // Kullanıcıyı güncelle
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || user.name,
          email: email || user.email,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      res.json({
        status: 'success',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kullanıcı silme
  static async deleteProfile(req, res, next) {
    try {
      const userId = req.user?.id;
      const { password } = req.body;

      // Kullanıcı kontrolü
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return next(new AppError('Kullanıcı bulunamadı', 404));
      }

      // Şifre kontrolü
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return next(new AppError('Şifre yanlış', 401));
      }

      await prisma.user.delete({
        where: { id: userId }
      });

      res.status(204).send();
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Kullanıcı istatistiklerini getir
  static async getUserStats(req, res, next) {
    try {
      const userId = parseInt(req.params.userId);
      // Kullanıcının var olduğunu kontrol et
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        return next(new AppError('Kullanıcı bulunamadı', 404));
      }
      // Kelime ilerlemesi istatistikleri
      const wordProgressStats = await prisma.userWordProgress.groupBy({
        by: ['proficiencyLevel'],
        where: { userId },
        _count: { id: true }
      });
      // Oyun sonuçları istatistikleri
      const gameStats = await prisma.gameResult.groupBy({
        by: ['gameType'],
        where: { userId },
        _count: { id: true },
        _avg: { score: true, correctAnswers: true, wrongAnswers: true, timeSpent: true },
        _max: { score: true }
      });
      // Hikaye istatistikleri
      const storyStats = await prisma.story.groupBy({
        by: ['difficultyLevel'],
        where: { userId },
        _count: { id: true }
      });
      res.json({
        wordProgress: wordProgressStats,
        games: gameStats,
        stories: storyStats
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = UserController; 