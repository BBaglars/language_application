const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const gameRoutes = require('./routes/gameRoutes');
const wordRoutes = require('./routes/wordRoutes');
const { errorHandler } = require('./middleware/errorHandler');

// .env dosyasını yükle
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/words', wordRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

module.exports = app; 