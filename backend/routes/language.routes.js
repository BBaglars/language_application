const express = require('express');
const LanguageController = require('../controllers/languageController.js');
const { authenticate } = require('../middleware/auth.middleware.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { createLanguageSchema, updateLanguageSchema } = require('../validations/language.validation.js');

const router = express.Router();

// Tüm route'lar için authentication gerekli
// router.use(authenticate); // Geliştirme için geçici olarak yoruma alındı

// Dil işlemleri
router.get('/', LanguageController.getAllLanguages);
router.get('/:id', LanguageController.getLanguage);
router.post('/', validateRequest(createLanguageSchema), LanguageController.createLanguage);
router.put('/:id', validateRequest(updateLanguageSchema), LanguageController.updateLanguage);
router.patch('/:id', validateRequest(updateLanguageSchema), LanguageController.updateLanguage);
router.delete('/:id', LanguageController.deleteLanguage);

module.exports = router; 