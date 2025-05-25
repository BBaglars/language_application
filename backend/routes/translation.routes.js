const express = require('express');
const TranslationController = require('../controllers/translationController.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { createTranslationSchema, updateTranslationSchema } = require('../validations/translation.validation.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const router = express.Router();
const translationController = new TranslationController();

// Tüm route'lar için authentication gerekli
router.use(authenticate);

// Çeviri işlemleri
router.get('/', translationController.getTranslations);
router.get('/:id', translationController.getTranslationById);
router.post('/', translationController.createTranslation);
router.put('/:id', validateRequest(updateTranslationSchema), translationController.updateTranslation);
router.delete('/:id', translationController.deleteTranslation);

module.exports = router; 