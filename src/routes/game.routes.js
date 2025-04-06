const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { validateSchema, gameSessionSchema } = require('../middleware/validation.middleware');
const { catchAsync } = require('../middleware/error.middleware');
const GameService = require('../services/game.service');

// Oyun oturumu başlatma
router.post('/sessions',
    verifyFirebaseToken,
    validateSchema(gameSessionSchema),
    catchAsync(async (req, res) => {
        const session = await GameService.startGameSession(req.currentUser.id, req.body.game_type_id);
        res.status(201).json({
            status: 'success',
            data: { session }
        });
    })
);

// Oyun cevabını kaydetme
router.post('/sessions/:sessionId/answers',
    verifyFirebaseToken,
    validateSchema({
        word_id: Joi.number().required(),
        answer: Joi.string().required(),
        is_correct: Joi.boolean().required()
    }),
    catchAsync(async (req, res) => {
        await GameService.submitAnswer(
            req.params.sessionId,
            req.body.word_id,
            req.body.answer,
            req.body.is_correct
        );
        res.status(200).json({
            status: 'success',
            message: 'Cevap kaydedildi'
        });
    })
);

// Oyun oturumunu tamamlama
router.post('/sessions/:sessionId/complete',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const result = await GameService.completeGameSession(req.params.sessionId);
        res.status(200).json({
            status: 'success',
            data: { result }
        });
    })
);

// Kullanıcının oyun istatistiklerini getirme
router.get('/stats',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const stats = await GameService.getUserGameStats(req.currentUser.id);
        res.status(200).json({
            status: 'success',
            data: { stats }
        });
    })
);

// Oyun tiplerini getirme
router.get('/types',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const gameTypes = await GameService.getGameTypes();
        res.status(200).json({
            status: 'success',
            data: { gameTypes }
        });
    })
);

// Oyun oturumu detaylarını getirme
router.get('/sessions/:sessionId',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const details = await GameService.getGameSessionDetails(req.params.sessionId);
        res.status(200).json({
            status: 'success',
            data: { details }
        });
    })
);

// Kullanıcının oyun oturumlarını getirme
router.get('/sessions',
    verifyFirebaseToken,
    validateQuery({
        ...paginationSchema,
        game_type_id: Joi.number().optional(),
        status: Joi.string().valid('active', 'completed').optional()
    }),
    catchAsync(async (req, res) => {
        const sessions = await GameService.getUserSessions(req.currentUser.id, req.query);
        res.status(200).json({
            status: 'success',
            data: { sessions }
        });
    })
);

// Oyun başarılarını getirme
router.get('/achievements',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const achievements = await GameService.getUserAchievements(req.currentUser.id);
        res.status(200).json({
            status: 'success',
            data: { achievements }
        });
    })
);

// Oyun sıralamasını getirme
router.get('/leaderboard',
    verifyFirebaseToken,
    validateQuery({
        game_type_id: Joi.number().required(),
        period: Joi.string().valid('daily', 'weekly', 'monthly', 'all').default('all')
    }),
    catchAsync(async (req, res) => {
        const leaderboard = await GameService.getLeaderboard(req.query);
        res.status(200).json({
            status: 'success',
            data: { leaderboard }
        });
    })
);

module.exports = router; 