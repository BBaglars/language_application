const express = require('express');
const StoryController = require('../controllers/storyController.js');
const { authenticate } = require('../middleware/auth.middleware.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { createStorySchema, updateStorySchema } = require('../validations/story.validation.js');

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(authenticate);

// Hikaye işlemleri
router.get('/', StoryController.getAllStories);
router.get('/:id', StoryController.getStory);
router.post('/', validateRequest(createStorySchema), StoryController.createStory);
router.put('/:id', validateRequest(updateStorySchema), StoryController.updateStory);
router.patch('/:id', validateRequest(updateStorySchema), StoryController.updateStory);
router.delete('/:id', StoryController.deleteStory);

module.exports = router; 