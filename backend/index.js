require('dotenv/config');
const app = require('./app');
const logger = require('./utils/logger.js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Veritabanı bağlantısını test et
prisma.$connect()
  .then(() => {
    logger.info('Veritabanı bağlantısı başarılı');
    
    // Sunucuyu başlat
    app.listen(port, () => {
      logger.info(`Sunucu ${port} portunda çalışıyor`);
    });
  })
  .catch((error) => {
    logger.error(`Veritabanı bağlantı hatası: ${error && error.stack ? error.stack : JSON.stringify(error)}`);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM sinyali alındı. Sunucu kapatılıyor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT sinyali alındı. Sunucu kapatılıyor...');
  await prisma.$disconnect();
  process.exit(0);
}); 