const express = require('express');
const router = express.Router();

// Tüm route'lar yoruma alındı
// const storyController = require('../controllers/storyController');
// const { auth } = require('../middleware/auth');

// router.get('/', auth, storyController.getAllStories);
// router.get('/:id', auth, storyController.getStoryById);
// router.post('/', auth, storyController.createStory);
// router.put('/:id', auth, storyController.updateStory);
// router.delete('/:id', auth, storyController.deleteStory);
// router.get('/:id/words', storyController.getStoryWords);
// router.get('/user/stories', auth, storyController.getUserStories);

// Ana route'u tanımla
router.get('/', (req, res) => {
  res.json({ message: 'Hikaye API\'si henüz implement edilmedi' });
});

module.exports = router; 