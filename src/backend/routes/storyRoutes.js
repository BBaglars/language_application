const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { auth } = require('../middleware/auth');

// Hikaye işlemleri
router.get('/', auth, storyController.getAllStories);
router.get('/:id', auth, storyController.getStoryById);
router.post('/', auth, storyController.createStory);
router.put('/:id', auth, storyController.updateStory);
router.delete('/:id', auth, storyController.deleteStory);

// Hikaye-kelime ilişkileri
router.get('/:id/words', storyController.getStoryWords);

// Kullanıcı hikayeleri
router.get('/user/stories', auth, storyController.getUserStories);

module.exports = router; 