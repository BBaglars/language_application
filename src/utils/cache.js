const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

// Redis bağlantı olaylarını dinle
redis.on('connect', () => {
    logger.info('Redis bağlantısı başarılı');
});

redis.on('error', (error) => {
    logger.error('Redis bağlantı hatası:', error);
});

// Önbelleğe veri ekle
const setCache = async (key, value, ttl = 3600) => {
    try {
        const serializedValue = JSON.stringify(value);
        await redis.setex(key, ttl, serializedValue);
        return true;
    } catch (error) {
        logger.error('Önbelleğe veri ekleme hatası:', error);
        return false;
    }
};

// Önbellekten veri al
const getCache = async (key) => {
    try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        logger.error('Önbellekten veri alma hatası:', error);
        return null;
    }
};

// Önbellekten veri sil
const deleteCache = async (key) => {
    try {
        await redis.del(key);
        return true;
    } catch (error) {
        logger.error('Önbellekten veri silme hatası:', error);
        return false;
    }
};

// Önbelleği temizle
const clearCache = async () => {
    try {
        await redis.flushall();
        return true;
    } catch (error) {
        logger.error('Önbellek temizleme hatası:', error);
        return false;
    }
};

// Önbellek anahtarını oluştur
const generateCacheKey = (prefix, params) => {
    const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
            acc[key] = params[key];
            return acc;
        }, {});

    return `${prefix}:${JSON.stringify(sortedParams)}`;
};

module.exports = {
    redis,
    setCache,
    getCache,
    deleteCache,
    clearCache,
    generateCacheKey
}; 