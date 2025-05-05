const { pool } = require('../src/backend/config/database');

beforeEach(async () => {
  try {
    // Tüm tabloları temizle
    const tables = [
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

    for (const table of tables) {
      await pool.query(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  } catch (error) {
    console.error('Test setup error:', error);
    throw error;
  }
});

// Test suite tamamlandığında pool'u kapat
afterAll(async () => {
  try {
    await pool.end();
  } catch (error) {
    console.error('Error closing pool:', error);
  }
}); 