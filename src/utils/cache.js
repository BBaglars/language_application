// Redis olmadan basit bir in-memory cache implementasyonu
class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.logger = require('./logger');
    }

    async get(key) {
        try {
            const value = this.cache.get(key);
            if (value) {
                this.logger.debug(`Cache hit for key: ${key}`);
                return value;
            }
            this.logger.debug(`Cache miss for key: ${key}`);
            return null;
        } catch (error) {
            this.logger.error('Cache get error:', error);
            return null;
        }
    }

    async set(key, value, ttl = 3600) {
        try {
            this.cache.set(key, value);
            this.logger.debug(`Cache set for key: ${key}`);
            
            // TTL için setTimeout kullan
            setTimeout(() => {
                this.cache.delete(key);
                this.logger.debug(`Cache expired for key: ${key}`);
            }, ttl * 1000);
            
            return true;
        } catch (error) {
            this.logger.error('Cache set error:', error);
            return false;
        }
    }

    async del(key) {
        try {
            this.cache.delete(key);
            this.logger.debug(`Cache deleted for key: ${key}`);
            return true;
        } catch (error) {
            this.logger.error('Cache delete error:', error);
            return false;
        }
    }

    async flush() {
        try {
            this.cache.clear();
            this.logger.debug('Cache flushed');
            return true;
        } catch (error) {
            this.logger.error('Cache flush error:', error);
            return false;
        }
    }
}

// Singleton instance
const cache = new MemoryCache();

module.exports = cache; 