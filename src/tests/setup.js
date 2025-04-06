require('dotenv').config();
const { pool } = require('../db/db');

// Test veritabanı bağlantısını kontrol et
beforeAll(async () => {
    try {
        const client = await pool.connect();
        client.release();
    } catch (error) {
        console.error('Veritabanı bağlantı hatası:', error);
        process.exit(1);
    }
});

// Test sonrası bağlantıyı kapat
afterAll(async () => {
    await pool.end();
}); 