const { PrismaClient } = require('@prisma/client');
const app = require('../backend/app');

const prisma = new PrismaClient();
let server;

beforeAll(async () => {
  // İlişkili tabloları doğru sırayla temizle
  await prisma.$transaction([
    prisma.userWordProgress.deleteMany(),
    prisma.translation.deleteMany(),
    prisma.wordCategory.deleteMany(),
    prisma.storyWord.deleteMany(),
    prisma.gameResult.deleteMany(),
    prisma.word.deleteMany(),
    prisma.category.deleteMany(),
    prisma.story.deleteMany(),
    prisma.storyGenerationJob.deleteMany(),
    prisma.storyGenerationCriteria.deleteMany(),
    prisma.languagePair.deleteMany(),
    prisma.language.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Sunucuyu başlat
  if (!server) {
    server = app.listen(process.env.PORT || 3001);
  }
});

afterAll(async () => {
  // Sunucuyu durdur
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await prisma.$disconnect();
});

// Test ortamı değişkenlerini ayarla
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Test için farklı bir port kullan
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX = '100';

// Test veritabanını temizle
beforeAll(async () => {
  await prisma.translation.deleteMany({});
  await prisma.word.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.language.deleteMany({});
  await prisma.user.deleteMany({});
});

// Her test sonrası veritabanını temizle
afterEach(async () => {
  await prisma.translation.deleteMany({});
  await prisma.word.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.language.deleteMany({});
  await prisma.user.deleteMany({});
});

// Tüm testler bittikten sonra Prisma bağlantısını kapat
afterAll(async () => {
  await prisma.$disconnect();
});