const { PrismaClient } = require('@prisma/client');
const config = require('./config/index.js');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url
    }
  }
});

// Veritabanı bağlantısını test et
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Veritabanı bağlantısı başarılı');
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    process.exit(1);
  }
}

export {
  prisma,
  testConnection
}; 