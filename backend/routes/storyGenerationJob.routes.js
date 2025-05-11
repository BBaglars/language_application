const express = require('express');
const router = express.Router();
const StoryGenerationJobController = require('../controllers/storyGenerationJobController.js');
const { authenticate } = require('../middleware/auth.middleware.js');

// Tüm işleri getir
router.get('/', authenticate, StoryGenerationJobController.getAllJobs);
// Kullanıcının işlerini getir
router.get('/user', authenticate, StoryGenerationJobController.getUserJobs);
// Bekleyen işleri getir
router.get('/pending', authenticate, StoryGenerationJobController.getPendingJobs);
// İş detayını getir
router.get('/:id', authenticate, StoryGenerationJobController.getJobById);
// Yeni iş oluştur
router.post('/', authenticate, StoryGenerationJobController.createJob);
// İş güncelle
router.patch('/:id', authenticate, StoryGenerationJobController.updateJob);
router.put('/:id', authenticate, StoryGenerationJobController.updateJob);
// İş sil
router.delete('/:id', authenticate, StoryGenerationJobController.deleteJob);

module.exports = router; 