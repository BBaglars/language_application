const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), process.env.LOG_FILE || 'logs/app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs/combined.log')
    })
  ]
});

// Geliştirme ortamında daha detaylı loglama
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.File({
    filename: path.join(process.cwd(), 'logs/error.log'),
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5,
    tailable: true
  }));
}

module.exports = logger; 