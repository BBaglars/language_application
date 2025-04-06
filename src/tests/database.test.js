const { pool, testConnection } = require('../db/db');
const logger = require('../utils/logger');

describe('Veritabanı Testleri', () => {
    // Veritabanı bağlantısını test et
    it('Veritabanına bağlanabilmeli', async () => {
        try {
            const client = await pool.connect();
            expect(client).toBeTruthy();
            client.release();
            logger.info('Veritabanı bağlantısı başarılı');
        } catch (error) {
            logger.error('Veritabanı bağlantı hatası:', error);
            throw error;
        }
    });

    // Temel tabloların varlığını kontrol et
    it('Temel tablolar mevcut olmalı', async () => {
        try {
            const client = await pool.connect();
            const result = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            
            const tables = result.rows.map(row => row.table_name);
            expect(tables).toContain('users');
            expect(tables).toContain('words');
            expect(tables).toContain('languages');
            expect(tables).toContain('categories');
            
            client.release();
            logger.info('Temel tablolar kontrol edildi');
        } catch (error) {
            logger.error('Tablo kontrolü hatası:', error);
            throw error;
        }
    });

    // Test bağlantı fonksiyonunu test et
    it('testConnection fonksiyonu çalışmalı', async () => {
        await expect(testConnection()).resolves.not.toThrow();
    });

    // Veritabanı bağlantı havuzunu test et
    it('Bağlantı havuzu düzgün çalışmalı', async () => {
        const client = await pool.connect();
        const result = await client.query('SELECT 1 as test');
        expect(result.rows[0].test).toBe(1);
        client.release();
    });
}); 