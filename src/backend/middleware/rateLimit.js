const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 dakika
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

const rateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    status: 'error',
    message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.'
  },
  standardHeaders: true, // Rate limit bilgilerini header'larda döndür
  legacyHeaders: false, // Eski header'ları devre dışı bırak
  skip: (req) => {
    // API anahtarı ile gelen istekleri atla
    return req.headers['x-api-key'] === process.env.API_KEY;
  },
  keyGenerator: (req) => {
    // IP ve kullanıcı ID'sine göre rate limit
    return `${req.ip}-${req.user?.id || 'anonymous'}`;
  }
});

module.exports = { rateLimiter }; 