const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { validateSchema, generateTextSchema } = require('../middleware/validation.middleware');
const { catchAsync } = require('../middleware/error.middleware');
const AIService = require('../services/ai.service');

// Metin oluşturma
router.post('/generate',
    verifyFirebaseToken,
    validateSchema(generateTextSchema),
    catchAsync(async (req, res) => {
        const text = await AIService.generateText(
            req.currentUser.id,
            req.body.category_id,
            req.body.word_count
        );
        res.status(201).json({
            status: 'success',
            data: { text }
        });
    })
);

// Dilbilgisi kontrolü
router.post('/check-grammar',
    verifyFirebaseToken,
    validateSchema({
        text: Joi.string().required().min(1).max(1000)
    }),
    catchAsync(async (req, res) => {
        const result = await AIService.checkGrammar(req.body.text);
        res.status(200).json({
            status: 'success',
            data: { result }
        });
    })
);

// Oluşturulan metinleri getirme
router.get('/texts',
    verifyFirebaseToken,
    validateQuery({
        category_id: Joi.number().optional(),
        ...paginationSchema
    }),
    catchAsync(async (req, res) => {
        const texts = await AIService.getGeneratedTexts(
            req.currentUser.id,
            req.query.category_id
        );
        res.status(200).json({
            status: 'success',
            data: { texts }
        });
    })
);

// Metin analizi
router.post('/analyze',
    verifyFirebaseToken,
    validateSchema({
        text: Joi.string().required().min(1).max(1000)
    }),
    catchAsync(async (req, res) => {
        const analysis = await AIService.analyzeText(req.body.text);
        res.status(200).json({
            status: 'success',
            data: { analysis }
        });
    })
);

// Kelime önerileri
router.get('/suggest-words',
    verifyFirebaseToken,
    validateQuery({
        category_id: Joi.number().required()
    }),
    catchAsync(async (req, res) => {
        const suggestions = await AIService.suggestWords(
            req.currentUser.id,
            req.query.category_id
        );
        res.status(200).json({
            status: 'success',
            data: { suggestions }
        });
    })
);

// Metin özetleme
router.post('/summarize',
    verifyFirebaseToken,
    validateSchema({
        text: Joi.string().required().min(1).max(2000),
        max_length: Joi.number().min(50).max(500).optional()
    }),
    catchAsync(async (req, res) => {
        const summary = await AIService.summarizeText(
            req.body.text,
            req.body.max_length
        );
        res.status(200).json({
            status: 'success',
            data: { summary }
        });
    })
);

// Metin çeviri
router.post('/translate',
    verifyFirebaseToken,
    validateSchema({
        text: Joi.string().required().min(1).max(1000),
        target_language: Joi.string().required().length(2)
    }),
    catchAsync(async (req, res) => {
        const translation = await AIService.translateText(
            req.body.text,
            req.body.target_language
        );
        res.status(200).json({
            status: 'success',
            data: { translation }
        });
    })
);

// Metin zorluk seviyesi analizi
router.post('/analyze-difficulty',
    verifyFirebaseToken,
    validateSchema({
        text: Joi.string().required().min(1).max(1000)
    }),
    catchAsync(async (req, res) => {
        const difficulty = await AIService.analyzeTextDifficulty(req.body.text);
        res.status(200).json({
            status: 'success',
            data: { difficulty }
        });
    })
);

module.exports = router; 