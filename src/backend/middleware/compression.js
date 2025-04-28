const compression = require('compression');

const compressionOptions = {
  level: 6, // 0-9 arası, 6 varsayılan
  threshold: 1024, // 1KB'dan küçük yanıtları sıkıştırma
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
};

module.exports = compression(compressionOptions); 