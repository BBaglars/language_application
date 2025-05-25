const logger = require('../utils/logger.js');

const responseMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Eğer zaten status veya data anahtarı varsa dokunma
    if (data && (data.status || data.data)) {
      return originalJson.call(this, data);
    }
    // Eğer sadece message anahtarı varsa dokunma
    if (data && Object.keys(data).length === 1 && data.message) {
      return originalJson.call(this, data);
    }
    // Sadece başarılı (200-299) durumlarda sarmala
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return originalJson.call(this, { status: 'success', data });
    }
    // Hata durumunda olduğu gibi bırak
    return originalJson.call(this, data);
  };

  next();
};

module.exports = responseMiddleware; 