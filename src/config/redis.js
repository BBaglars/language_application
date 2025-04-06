const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('connect', () => {
    logger.info('Redis bağlantısı başarılı');
});

redis.on('error', (error) => {
    logger.error('Redis bağlantı hatası:', error);
});

// Önbellek yardımcı fonksiyonları
const cache = {
    // Veriyi önbelleğe al
    set: async (key, value, ttl = 3600) => {
        try {
            const serializedValue = JSON.stringify(value);
            await redis.set(key, serializedValue, 'EX', ttl);
            return true;
        } catch (error) {
            logger.error('Önbellek yazma hatası:', error);
            return false;
        }
    },

    // Önbellekten veri al
    get: async (key) => {
        try {
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error('Önbellek okuma hatası:', error);
            return null;
        }
    },

    // Önbellekten veri sil
    del: async (key) => {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            logger.error('Önbellek silme hatası:', error);
            return false;
        }
    },

    // Önbelleği temizle
    clear: async () => {
        try {
            await redis.flushall();
            return true;
        } catch (error) {
            logger.error('Önbellek temizleme hatası:', error);
            return false;
        }
    }
};

module.exports = { redis, cache }; 