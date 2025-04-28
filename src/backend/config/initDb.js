const { pool } = require('./database');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    // SQL dosyasını oku
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // SQL komutlarını çalıştır
    await pool.query(schemaSql);
    console.log('Veritabanı şeması başarıyla oluşturuldu.');

    // Örnek verileri ekle
    await pool.query(`
      INSERT INTO languages (code, name, native_name) 
      VALUES 
        ('en', 'English', 'English'),
        ('tr', 'Turkish', 'Türkçe'),
        ('es', 'Spanish', 'Español')
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('Örnek diller eklendi.');

  } catch (error) {
    console.error('Veritabanı başlatma hatası:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Script doğrudan çalıştırıldığında
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initDatabase; 