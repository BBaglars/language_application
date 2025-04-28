const { pool } = require('../src/backend/config/database');

let isPoolEnded = false;

beforeEach(async () => {
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
});

// Test suite tamamlandığında pool'u kapat
afterAll(async () => {
  if (!isPoolEnded) {
    isPoolEnded = true;
    await pool.end();
  }
}); 