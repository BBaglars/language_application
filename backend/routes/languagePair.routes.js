const express = require('express');
const LanguagePairController = require('../controllers/languagePairController.js');
const { authenticate } = require('../middleware/auth.middleware.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { createLanguagePairSchema, updateLanguagePairSchema } = require('../validations/languagePair.validation.js');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(authenticate);

// Dil çifti işlemleri
router.get('/', LanguagePairController.getAllLanguagePairs);
router.get('/:id', LanguagePairController.getLanguagePair);
router.post('/', validateRequest(createLanguagePairSchema), LanguagePairController.createLanguagePair);
router.put('/:id', validateRequest(updateLanguagePairSchema), LanguagePairController.updateLanguagePair);
router.delete('/:id', LanguagePairController.deleteLanguagePair);

module.exports = router; 