require('dotenv').config();

const config = {
  // Uygulama Ayarları
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,

  // Veritabanı Ayarları
  DATABASE_URL: process.env.DATABASE_URL,

  // Redis Ayarları
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // CORS Ayarları
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],

  // Firebase Ayarları
  FIREBASE: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  },

  // Rate Limiting Ayarları
  RATE_LIMIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Cache Ayarları
  CACHE: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600,
    prefix: process.env.CACHE_PREFIX || 'lang_app_'
  },

  // Loglama Ayarları
  LOG: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || 'logs/app.log'
  },

  // Güvenlik Ayarları
  JWT: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  COOKIE_SECRET: process.env.COOKIE_SECRET,

  // OpenAI Ayarları
  OPENAI: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  },

  // E-posta Ayarları
  SMTP: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

module.exports = config; 