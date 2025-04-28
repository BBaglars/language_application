const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

router.get('/', wordController.getWords);
router.post('/', wordController.createWord);
router.get('/:id', wordController.getWordById);
router.put('/:id', wordController.updateWord);
router.delete('/:id', wordController.deleteWord);
router.get('/:id/categories', wordController.getWordCategories);
router.post('/:id/categories/:categoryId', wordController.addWordToCategory);
router.delete('/:id/categories/:categoryId', wordController.removeWordFromCategory);
router.get('/:id/translations', wordController.getWordTranslations);
router.post('/:id/translations', wordController.addTranslation);
router.delete('/:id/translations/:translationId', wordController.removeTranslation);

module.exports = router; 