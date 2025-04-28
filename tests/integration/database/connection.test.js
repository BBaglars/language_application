const { pool } = require('../../../src/backend/config/database');
const fs = require('fs');
const path = require('path');

describe('Database Connection Integration Tests', () => {
  test('Veritabanı bağlantısı başarılı', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toBeDefined();
  });

  test('Tablolar oluşturulmuş olmalı', async () => {
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    expect(result.rows.length).toBeGreaterThan(0);
  });

  test('Örnek veri ekleme ve sorgulama çalışmalı', async () => {
    // Önce ilişkili tabloları temizle
    await pool.query('DELETE FROM word_categories');
    await pool.query('DELETE FROM words');
    await pool.query('DELETE FROM categories');
    
    // Örnek veri ekle
    await pool.query(`
      INSERT INTO categories (name, description)
      VALUES ('Test Kategori', 'Test Açıklama')
      RETURNING id
    `);
    
    const result = await pool.query('SELECT * FROM categories');
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toBe('Test Kategori');
  });

  afterAll(async () => {
    await pool.end();
  });
}); 