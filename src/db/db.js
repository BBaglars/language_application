const { Pool } = require('pg');
const logger = require('../utils/logger');

// PostgreSQL bağlantı havuzu oluştur
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'language_app',
    password: process.env.DB_PASSWORD || 
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Bağlantı hatası durumunda logla
pool.on('error', (err) => {
    logger.error('PostgreSQL bağlantı hatası:', err);
});

// Bağlantıyı test et
const testConnection = async () => {
    try {
        const client = await pool.connect();
        logger.info('PostgreSQL bağlantısı başarılı');
        client.release();
    } catch (error) {
        logger.error('PostgreSQL bağlantı hatası:', error);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection
}; 
