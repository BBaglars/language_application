const { cache } = require('../config/redis');

const cacheMiddleware = (duration = 3600) => {
    return async (req, res, next) => {
        // Sadece GET istekleri için önbellek kullan
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            // Önbellekten veriyi al
            const cachedData = await cache.get(key);

            if (cachedData) {
                return res.json(cachedData);
            }

            // Orijinal send metodunu sakla
            const originalSend = res.send;
            
            // Send metodunu override et
            res.send = function (body) {
                // Veriyi önbelleğe al
                cache.set(key, body, duration);
                
                // Orijinal send metodunu çağır
                originalSend.call(this, body);
            };

            next();
        } catch (error) {
            next();
        }
    };
};

module.exports = cacheMiddleware; 