const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { Pool } = require('pg');
const OpenAI = require('openai');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const wordRoutes = require('./routes/word.routes');
const gameRoutes = require('./routes/game.routes');
const aiRoutes = require('./routes/ai.routes');

// Middleware
const errorHandler = require('./middleware/error.middleware');
const authMiddleware = require('./middleware/auth.middleware');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/words', authMiddleware, wordRoutes);
app.use('/api/games', authMiddleware, gameRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 