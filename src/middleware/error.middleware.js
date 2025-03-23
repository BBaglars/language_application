const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validasyon hatası',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Yetkilendirme hatası',
      details: err.message
    });
  }

  res.status(500).json({
    error: 'Sunucu hatası',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu'
  });
};

module.exports = errorHandler; 