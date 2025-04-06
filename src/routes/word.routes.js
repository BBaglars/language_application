const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, checkAdminRole, checkUserPermission } = require('../middleware/auth.middleware');
const { validateSchema, wordSchema, validateQuery, paginationSchema, filterSchema } = require('../middleware/validation.middleware');
const { catchAsync } = require('../middleware/error.middleware');
const WordService = require('../services/word.service');
const Joi = require('joi');

// Kelime ekleme (sadece admin)
router.post('/',
    verifyFirebaseToken,
    checkAdminRole,
    validateSchema(wordSchema),
    catchAsync(async (req, res) => {
        const word = await WordService.addWord(req.admin.id, req.body);
        res.status(201).json({
            status: 'success',
            data: { word }
        });
    })
);

// Kelime detaylarını getirme
router.get('/:id',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const word = await WordService.getWordById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { word }
        });
    })
);

// Kullanıcının kelimelerini getirme
router.get('/user/:userId',
    verifyFirebaseToken,
    checkUserPermission,
    validateQuery({ ...paginationSchema, ...filterSchema }),
    catchAsync(async (req, res) => {
        const words = await WordService.getWordsByUser(req.params.userId, req.query);
        res.status(200).json({
            status: 'success',
            data: { words }
        });
    })
);

// Kategoriye göre kelimeleri getirme
router.get('/category/:categoryId',
    verifyFirebaseToken,
    validateQuery({ ...paginationSchema, ...filterSchema }),
    catchAsync(async (req, res) => {
        const words = await WordService.getWordsByCategory(req.params.categoryId, req.query);
        res.status(200).json({
            status: 'success',
            data: { words }
        });
    })
);

// Kelime güncelleme (sadece admin)
router.put('/:id',
    verifyFirebaseToken,
    checkAdminRole,
    validateSchema(wordSchema),
    catchAsync(async (req, res) => {
        const word = await WordService.updateWord(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { word }
        });
    })
);

// Kelime silme (sadece admin)
router.delete('/:id',
    verifyFirebaseToken,
    checkAdminRole,
    catchAsync(async (req, res) => {
        await WordService.deleteWord(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    })
);

// Kelime seviyesini güncelleme
router.patch('/:id/mastery',
    verifyFirebaseToken,
    validateSchema({
        mastery_level: Joi.number().min(0).max(5).required()
    }),
    catchAsync(async (req, res) => {
        await WordService.updateWordMastery(req.currentUser.id, req.params.id, req.body.mastery_level);
        res.status(200).json({
            status: 'success',
            message: 'Kelime seviyesi güncellendi'
        });
    })
);

// Oyun için kelimeleri getirme
router.get('/game/:gameTypeId',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const words = await WordService.getWordsForGame(req.currentUser.id, req.params.gameTypeId);
        res.status(200).json({
            status: 'success',
            data: { words }
        });
    })
);

// Kelime arama
router.get('/search',
    verifyFirebaseToken,
    validateQuery({
        query: Joi.string().min(1).required(),
        ...paginationSchema
    }),
    catchAsync(async (req, res) => {
        const words = await WordService.searchWords(req.query.query, req.query);
        res.status(200).json({
            status: 'success',
            data: { words }
        });
    })
);

// Kelime istatistiklerini getirme
router.get('/:id/stats',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const stats = await WordService.getWordStats(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { stats }
        });
    })
);

module.exports = router; 