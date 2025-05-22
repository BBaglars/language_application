const express = require('express');
const { register, login, logout, refreshToken } = require('../controllers/auth.controller.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { registerSchema, loginSchema } = require('../validations/auth.validation.js');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../config/firebase');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// Google ile giriş
router.post('/google-login', async (req, res) => {
  try {
    const { firebaseId, email, name, photoURL } = req.body;

    // Kullanıcıyı önce firebaseId ile bul
    let user = await prisma.user.findUnique({ where: { firebaseId } });

    if (!user) {
      // firebaseId ile bulamazsa email ile bul
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        // Email ile bulursa firebaseId'yi güncelle
        user = await prisma.user.update({
          where: { email },
          data: { firebaseId, name, photoURL }
        });
      } else {
        // Hiçbiri yoksa yeni kullanıcı oluştur
        user = await prisma.user.create({
          data: { firebaseId, email, name, photoURL, role: 'USER' }
        });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          firebaseId: user.firebaseId
        },
        token
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Giriş işlemi sırasında bir hata oluştu'
    });
  }
});

/**
 * GEÇİCİ ÇÖZÜM: Mobilde e-posta ile giriş için kullanılır.
 * E-posta ile gelen kullanıcıyı veritabanında arar ve Google login ile dönen bilgileri döner.
 * İLERİDE GOOGLE İLE GİRİŞ TAMAMEN ENTEGRE EDİLDİĞİNDE BU ENDPOINT KALDIRILACAKTIR!
 */
router.post('/email-login', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'E-posta zorunlu!' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // JWT token oluştur
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          photoURL: user.photoURL,
          firebaseId: user.firebaseId,
          role: user.role
        },
        token
      });
    } else {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı!' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Sunucu hatası!' });
  }
});

module.exports = router; 