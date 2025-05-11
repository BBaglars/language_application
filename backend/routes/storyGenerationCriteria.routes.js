const express = require('express');
const StoryGenerationCriteriaController = require('../controllers/storyGenerationCriteriaController.js');
const { authenticate } = require('../middleware/auth.middleware.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { createCriteriaSchema, updateCriteriaSchema } = require('../validations/storyGenerationCriteria.validation.js');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(authenticate);

// Hikaye üretim kriteri işlemleri
router.get('/', StoryGenerationCriteriaController.getAllCriteria);
router.get('/:id', StoryGenerationCriteriaController.getCriteriaById);
router.post('/', validateRequest(createCriteriaSchema), StoryGenerationCriteriaController.createCriteria);
router.put('/:id', validateRequest(updateCriteriaSchema), StoryGenerationCriteriaController.updateCriteria);
router.delete('/:id', StoryGenerationCriteriaController.deleteCriteria);

module.exports = router; 