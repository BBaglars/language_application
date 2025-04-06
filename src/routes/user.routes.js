const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { validateSchema, userSchema } = require('../middleware/validation.middleware');
const { catchAsync } = require('../middleware/error.middleware');
const UserService = require('../services/user.service');
const Joi = require('joi');

// Kullanıcı profili getirme
router.get('/profile',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const profile = await UserService.getUserProfile(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { profile }
        });
    })
);

// Kullanıcı profili güncelleme
router.put('/profile',
    verifyFirebaseToken,
    validateSchema(userSchema),
    catchAsync(async (req, res) => {
        const profile = await UserService.updateUserProfile(req.user.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { profile }
        });
    })
);

// Kullanıcı istatistiklerini getirme
router.get('/stats',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const stats = await UserService.getUserStats(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { stats }
        });
    })
);

// Kullanıcı başarılarını getirme
router.get('/achievements',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const achievements = await UserService.getUserAchievements(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { achievements }
        });
    })
);

// Kullanıcı ilerleme durumunu getirme
router.get('/progress',
    verifyFirebaseToken,
    validateQuery({
        language_id: Joi.number().required(),
        category_id: Joi.number().optional(),
        level: Joi.string().optional()
    }),
    catchAsync(async (req, res) => {
        const progress = await UserService.getUserProgress(req.user.id, req.query);
        res.status(200).json({
            status: 'success',
            data: { progress }
        });
    })
);

// Kullanıcı kelime listesini getirme
router.get('/words',
    verifyFirebaseToken,
    validateQuery({
        language_id: Joi.number().required(),
        category_id: Joi.number().optional(),
        level: Joi.string().optional(),
        mastery_level: Joi.string().optional(),
        ...paginationSchema
    }),
    catchAsync(async (req, res) => {
        const words = await UserService.getUserWords(req.user.id, req.query);
        res.status(200).json({
            status: 'success',
            data: { words }
        });
    })
);

// Kullanıcı aktivite loglarını getirme
router.get('/activity-logs',
    verifyFirebaseToken,
    validateQuery({
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        activity_type: Joi.string().optional(),
        ...paginationSchema
    }),
    catchAsync(async (req, res) => {
        const logs = await UserService.getUserActivityLogs(req.user.id, req.query);
        res.status(200).json({
            status: 'success',
            data: { logs }
        });
    })
);

// Kullanıcı ayarlarını getirme
router.get('/settings',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const settings = await UserService.getUserSettings(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { settings }
        });
    })
);

// Kullanıcı ayarlarını güncelleme
router.put('/settings',
    verifyFirebaseToken,
    validateSchema({
        settings: Joi.object().required()
    }),
    catchAsync(async (req, res) => {
        const settings = await UserService.updateUserSettings(req.user.id, req.body.settings);
        res.status(200).json({
            status: 'success',
            data: { settings }
        });
    })
);

// Kullanıcı bildirimlerini getirme
router.get('/notifications',
    verifyFirebaseToken,
    validateQuery({
        read: Joi.boolean().optional(),
        ...paginationSchema
    }),
    catchAsync(async (req, res) => {
        const notifications = await UserService.getUserNotifications(req.user.id, req.query);
        res.status(200).json({
            status: 'success',
            data: { notifications }
        });
    })
);

// Bildirimleri okundu olarak işaretleme
router.put('/notifications/read',
    verifyFirebaseToken,
    validateSchema({
        notification_ids: Joi.array().items(Joi.number()).required()
    }),
    catchAsync(async (req, res) => {
        await UserService.markNotificationsAsRead(req.user.id, req.body.notification_ids);
        res.status(200).json({
            status: 'success',
            data: null
        });
    })
);

module.exports = router; 