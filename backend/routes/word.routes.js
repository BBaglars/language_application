const express = require('express');
const WordController = require('../controllers/wordController.js');
const { authenticate } = require('../middleware/auth.middleware.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { createWordSchema, updateWordSchema } = require('../validations/word.validation.js');

const router = express.Router();
const wordController = new WordController();

// Tüm route'lar için authentication gerekli
router.use(authenticate);

// Kelime işlemleri
router.get('/', wordController.getWords);
router.get('/:id', wordController.getWordById);
router.post('/', validateRequest(createWordSchema), wordController.createWord);
router.put('/:id', validateRequest(updateWordSchema), wordController.updateWord);
router.patch('/:id', validateRequest(updateWordSchema), wordController.updateWord);
router.delete('/:id', wordController.deleteWord);

module.exports = router; 