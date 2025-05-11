const express = require('express');
const GameResultController = require('../controllers/gameResultController.js');
const { authenticate } = require('../middleware/auth.middleware.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { createGameResultSchema, updateGameResultSchema } = require('../validations/gameResult.validation.js');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(authenticate);

// Oyun sonucu işlemleri
router.get('/', GameResultController.getAllGameResults);
router.get('/:id', GameResultController.getGameResultById);
router.post('/', validateRequest(createGameResultSchema), GameResultController.createGameResult);
router.put('/:id', validateRequest(updateGameResultSchema), GameResultController.updateGameResult);
router.delete('/:id', GameResultController.deleteGameResult);

// Kullanıcı bazlı işlemler
router.get('/user/results', GameResultController.getUserResults);
router.get('/user/language/:languageId/results', GameResultController.getUserLanguageResults);
router.get('/user/stats', GameResultController.getUserStats);

module.exports = router; 