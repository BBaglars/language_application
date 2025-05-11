const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes.js');
const userRoutes = require('./user.routes.js');
const wordRoutes = require('./word.routes.js');
const categoryRoutes = require('./category.routes.js');
const languageRoutes = require('./language.routes.js');
const translationRoutes = require('./translation.routes.js');
const languagePairRoutes = require('./languagePair.routes.js');
const storyRoutes = require('./story.routes.js');
const storyGenerationCriteriaRoutes = require('./storyGenerationCriteria.routes.js');
const storyGenerationJobRoutes = require('./storyGenerationJob.routes.js');
const userWordProgressRoutes = require('./userWordProgress.routes.js');
const gameResultRoutes = require('./gameResult.routes.js');

// Ana route'ları birleştir
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/words', wordRoutes);
router.use('/categories', categoryRoutes);
router.use('/languages', languageRoutes);
router.use('/translations', translationRoutes);
router.use('/language-pairs', languagePairRoutes);
router.use('/stories', storyRoutes);
router.use('/story-generation-criteria', storyGenerationCriteriaRoutes);
router.use('/story-generation-jobs', storyGenerationJobRoutes);
router.use('/user-word-progress', userWordProgressRoutes);
router.use('/game-results', gameResultRoutes);

module.exports = router; 