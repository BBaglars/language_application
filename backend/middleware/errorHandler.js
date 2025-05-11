const { AppError } = require('../utils/errors.js');

const errorHandler = (err, req, res, next) => {
  // AppError sınıfından gelen hatalar için
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  // Diğer hatalar için
  console.error(err.stack);
  return res.status(500).json({
    message: 'Sunucu hatası'
  });
};

export default errorHandler; 