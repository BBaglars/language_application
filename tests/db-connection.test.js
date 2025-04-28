const { pool } = require('../src/backend/config/database');

describe('Database Connection Tests', () => {
  test('Veritabanı bağlantısı başarılı', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toBeDefined();
  });

  test('Tablolar oluşturulmuş olmalı', async () => {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const expectedTables = [
      'story_words',
      'word_categories',
      'example_sentences',
      'translations',
      'words',
      'categories',
      'stories',
      'games',
      'languages',
      'users'
    ];

    const actualTables = result.rows.map(row => row.table_name);
    expectedTables.forEach(table => {
      expect(actualTables).toContain(table);
    });
  });

  afterAll(async () => {
    await pool.end();
  });
}); 