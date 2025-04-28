const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');
const wordRoutes = require('./routes/wordRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100 // her IP için maksimum 100 istek
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/words', auth, wordRoutes);
app.use('/api/categories', auth, categoryRoutes);

// Error handling
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Bir hata oluştu',
        status: 'error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

module.exports = app; 