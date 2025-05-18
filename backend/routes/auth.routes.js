const express = require('express');
const { register, login, logout, refreshToken } = require('../controllers/auth.controller.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { registerSchema, loginSchema } = require('../validations/auth.validation.js');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../config/firebase');
const prisma = new PrismaClient();

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// Google ile giriş
router.post('/google-login', async (req, res) => {
  try {
    const { firebaseId, email, name, photoURL } = req.body;

    // Firebase token'ını doğrula
    const decodedToken = await auth.verifyIdToken(firebaseId);
    if (!decodedToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz Firebase token'
      });
    }

    // Kullanıcıyı veritabanında ara veya oluştur
    let user = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (!user) {
      // Yeni kullanıcı oluştur
      user = await prisma.user.create({
        data: {
          firebaseId,
          email,
          name,
          role: 'USER'
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
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

module.exports = router; 