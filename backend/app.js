require('dotenv/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const { errorHandler } = require('./middleware/error.middleware.js');
const responseMiddleware = require('./middleware/response.middleware.js');
const routes = require('./routes/index.js');
const logger = require('./utils/logger.js');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { AppError } = require('./utils/errors.js');
const statsRoutes = require('./routes/stats');

// Route'ları import et
const userRoutes = require('./routes/user.routes.js');
const languageRoutes = require('./routes/language.routes.js');
const wordRoutes = require('./routes/word.routes.js');
const translationRoutes = require('./routes/translation.routes.js');
const languagePairRoutes = require('./routes/languagePair.routes.js');
const storyRoutes = require('./routes/story.routes.js');
const storyGenerationCriteriaRoutes = require('./routes/storyGenerationCriteria.routes.js');
const gameRoutes = require('./routes/game.routes.js');
const userWordProgressRoutes = require('./routes/userWordProgress.routes.js');
const gameWordsRoutes = require('./routes/game-words');
const generationRoutes = require('./routes/generation');

const prisma = new PrismaClient();
const app = express();

// Güvenlik middleware'leri
app.use(helmet());
app.use(cors());

// Temel middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

// Response format middleware'i
app.use(responseMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // IP başına maksimum istek sayısı
});
if (process.env.NODE_ENV !== 'test') {
  app.use(limiter);
}

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ip: ${req.ip} - user: ${req.user?.id || 'anon'}`);
  next();
});

// Routes
app.use('/api', routes);
app.use('/api/stats', statsRoutes);
app.use('/api/generation', generationRoutes);

// Diğer route eklemeleri yoruma alındı
// app.use('/api/users', userRoutes);
// app.use('/api/languages', languageRoutes);
// app.use('/api/words', wordRoutes);
// app.use('/api/translations', translationRoutes);
// app.use('/api/language-pairs', languagePairRoutes);
// app.use('/api/stories', storyRoutes);
// app.use('/api/story-generation-criteria', storyGenerationCriteriaRoutes);
// app.use('/api/games', gameRoutes);
// app.use('/api/user-word-progress', userWordProgressRoutes);
// app.use('/api/game-words', gameWordsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;