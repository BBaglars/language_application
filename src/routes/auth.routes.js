const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, authLimiter } = require('../middleware/auth.middleware');
const { validateSchema, userSchema } = require('../middleware/validation.middleware');
const { catchAsync } = require('../middleware/error.middleware');
const UserService = require('../services/user.service');

// Kullanıcı kaydı
router.post('/register',
    authLimiter,
    validateSchema(userSchema),
    catchAsync(async (req, res) => {
        const user = await UserService.createUser(req.body);
        res.status(201).json({
            status: 'success',
            data: { user }
        });
    })
);

// Kullanıcı girişi
router.post('/login',
    authLimiter,
    validateSchema({
        email: userSchema.email,
        password: userSchema.password
    }),
    catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const user = await UserService.loginUser(email, password);
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    })
);

// Kullanıcı çıkışı
router.post('/logout',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        await UserService.logoutUser(req.user.uid);
        res.status(200).json({
            status: 'success',
            message: 'Başarıyla çıkış yapıldı'
        });
    })
);

// Şifre sıfırlama isteği
router.post('/forgot-password',
    authLimiter,
    validateSchema({ email: userSchema.email }),
    catchAsync(async (req, res) => {
        await UserService.requestPasswordReset(req.body.email);
        res.status(200).json({
            status: 'success',
            message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi'
        });
    })
);

// Şifre sıfırlama
router.post('/reset-password',
    authLimiter,
    validateSchema({
        token: Joi.string().required(),
        password: userSchema.password
    }),
    catchAsync(async (req, res) => {
        await UserService.resetPassword(req.body.token, req.body.password);
        res.status(200).json({
            status: 'success',
            message: 'Şifreniz başarıyla güncellendi'
        });
    })
);

// E-posta doğrulama
router.post('/verify-email',
    authLimiter,
    validateSchema({ token: Joi.string().required() }),
    catchAsync(async (req, res) => {
        await UserService.verifyEmail(req.body.token);
        res.status(200).json({
            status: 'success',
            message: 'E-posta adresiniz başarıyla doğrulandı'
        });
    })
);

// E-posta doğrulama bağlantısı gönderme
router.post('/resend-verification',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        await UserService.resendVerificationEmail(req.user.uid);
        res.status(200).json({
            status: 'success',
            message: 'Doğrulama bağlantısı e-posta adresinize gönderildi'
        });
    })
);

// Google ile giriş
router.post('/google',
    authLimiter,
    validateSchema({ idToken: Joi.string().required() }),
    catchAsync(async (req, res) => {
        const user = await UserService.loginWithGoogle(req.body.idToken);
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    })
);

// Facebook ile giriş
router.post('/facebook',
    authLimiter,
    validateSchema({ accessToken: Joi.string().required() }),
    catchAsync(async (req, res) => {
        const user = await UserService.loginWithFacebook(req.body.accessToken);
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    })
);

module.exports = router; 