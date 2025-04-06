const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'language_app',
    max: 20, // maksimum bağlantı sayısı
    idleTimeoutMillis: 30000, // 30 saniye
    connectionTimeoutMillis: 2000, // 2 saniye
});

pool.on('connect', () => {
    logger.info('PostgreSQL veritabanına bağlanıldı');
});

pool.on('error', (err) => {
    logger.error('PostgreSQL bağlantı hatası:', err);
});

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params)
}; 