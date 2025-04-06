const { redis } = require('../db');
const logger = require('../utils/logger');

const rateLimit = async (req, res, next) => {
    const key = `rate_limit:${req.ip}`;
    
    try {
        const current = await redis.incr(key);
        if (current === 1) {
            await redis.expire(key, 60); // 1 dakika
        }
        
        if (current > 100) { // Dakikada maksimum 100 istek
            logger.warn(`Rate limit aşıldı: ${req.ip}`);
            return res.status(429).json({
                error: 'Too many requests',
                retryAfter: 60
            });
        }
        
        next();
    } catch (error) {
        logger.error('Rate limiting hatası:', error);
        next(error);
    }
};

module.exports = rateLimit; 