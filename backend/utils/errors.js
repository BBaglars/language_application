const logger = require('./logger.js');

// Temel hata sınıfı
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = {}) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
    this.code = 'VALIDATION_ERROR';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Kimlik doğrulama hatası') {
    super(message, 401);
    this.name = 'AuthenticationError';
    this.code = 'AUTH_ERROR';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Bu işlem için yetkiniz yok') {
    super(message, 403);
    this.name = 'AuthorizationError';
    this.code = 'FORBIDDEN';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Kayıt bulunamadı') {
    super(message, 404);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Kayıt zaten mevcut') {
    super(message, 409);
    this.name = 'ConflictError';
    this.code = 'CONFLICT';
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Veritabanı hatası', originalError = null) {
    super(message, 500);
    this.name = 'DatabaseError';
    this.code = 'DB_ERROR';
    this.originalError = originalError;
  }
}

class ServiceError extends AppError {
  constructor(message = 'Servis hatası', serviceName = 'unknown') {
    super(message, 500);
    this.name = 'ServiceError';
    this.code = 'SERVICE_ERROR';
    this.serviceName = serviceName;
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit aşıldı') {
    super(message, 429);
    this.name = 'RateLimitError';
    this.code = 'RATE_LIMIT';
  }
}

class FileError extends AppError {
  constructor(message = 'Dosya işlem hatası') {
    super(message, 400);
    this.name = 'FileError';
    this.code = 'FILE_ERROR';
  }
}

class NetworkError extends AppError {
  constructor(message = 'Ağ hatası') {
    super(message, 503);
    this.name = 'NetworkError';
    this.code = 'NETWORK_ERROR';
  }
}

class CacheError extends AppError {
  constructor(message = 'Cache hatası') {
    super(message, 500);
    this.name = 'CacheError';
    this.code = 'CACHE_ERROR';
  }
}

// İşlenmeyen hataları yakala
process.on('unhandledRejection', (err) => {
  logger.error(`İşlenmeyen Promise Reddi: ${err && err.stack ? err.stack : JSON.stringify(err)}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Yakalanmamış Hata: ${err && err.stack ? err.stack : JSON.stringify(err)}`);
  process.exit(1);
});

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ServiceError,
  RateLimitError,
  FileError,
  NetworkError,
  CacheError
}; 