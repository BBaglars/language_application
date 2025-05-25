const { AppError, ValidationError, AuthenticationError } = require('../utils/errors.js');
const logger = require('../utils/logger.js');

const errorHandler = (err, req, res, next) => {
  // Hata detayını doğrudan terminale bas
  console.error('DETAYLI HATA:', err);
  // Hata logla
  logger.error({
    error: err.message,
    name: err.name,
    code: err.code,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user?.id,
    fullError: JSON.stringify(err, Object.getOwnPropertyNames(err))
  });

  // ValidationError ise
  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      data: null
    });
  }

  // AuthenticationError ise
  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      status: 'error',
      message: err.message,
      data: null
    });
  }

  // AppError ise
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      data: null
    });
  }

  // JWT hataları
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Geçersiz token',
      data: null
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token süresi dolmuş',
      data: null
    });
  }

  // Prisma hataları
  if (err.code === 'P2002') {
    return res.status(400).json({
      status: 'error',
      message: 'Bu kayıt zaten mevcut',
      data: null
    });
  }

  // Diğer hatalar
  return res.status(500).json({
    status: 'error',
    message: 'Sunucu hatası',
    data: null
  });
};

module.exports = { errorHandler }; 