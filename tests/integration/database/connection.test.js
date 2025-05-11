const { prisma } = require('../../../backend/config');

describe('Database Connection Integration Tests', () => {
  beforeEach(async () => {
    // Test verilerini temizle
    await prisma.wordCategory.deleteMany();
    await prisma.word.deleteMany();
    await prisma.category.deleteMany();
  });

  test('Veritabanı bağlantısı başarılı', async () => {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    expect(result).toBeDefined();
    expect(result[0].now).toBeDefined();
  });

  test('Veritabanı bağlantı hatası durumu', async () => {
    const invalidPrisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('Bağlantı hatası'))
    };
    await expect(invalidPrisma.$queryRaw`SELECT NOW()`).rejects.toThrow('Bağlantı hatası');
  });

  test('Tablolar oluşturulmuş olmalı', async () => {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const expectedTables = [
      '_prisma_migrations',
      'WordCategory',
      'Category',
      'Language',
      'StoryWord',
      'GameResult',
      'Story',
      'UserWordProgress',
      'LanguagePair',
      'StoryGenerationCriteria',
      'StoryGenerationJob',
      'Word'
    ];
    const existingTables = tables.map(row => row.table_name);
    expectedTables.forEach(table => {
      expect(existingTables).toContain(table);
    });
  });

  test('Örnek veri ekleme ve sorgulama çalışmalı', async () => {
    // Örnek veri ekle
    const category = await prisma.category.create({
      data: {
        name: 'Test Kategori',
        description: 'Test Açıklama'
      }
    });
    expect(category.id).toBeDefined();
    // Eklenen veriyi sorgula
    const categories = await prisma.category.findMany();
    expect(categories.length).toBe(1);
    expect(categories[0].name).toBe('Test Kategori');
    expect(categories[0].description).toBe('Test Açıklama');
  });

  test('İlişkisel veri ekleme ve sorgulama çalışmalı', async () => {
    // Önce dil oluştur
    const language = await prisma.language.create({
      data: {
        code: `en_${Date.now()}`,
        name: 'English'
      }
    });
    // Kategori ekle
    const category = await prisma.category.create({
      data: {
        name: 'Test Kategori',
        description: 'Test Açıklama'
      }
    });
    // Kelime ekle
    const word = await prisma.word.create({
      data: {
        text: 'test',
        meaning: 'deneme',
        difficultyLevel: 'A1',
        letterCount: 4,
        language: {
          connect: {
            id: language.id
          }
        }
      }
    });
    // İlişki ekle
    await prisma.wordCategory.create({
      data: {
        wordId: word.id,
        categoryId: category.id
      }
    });
    // İlişkili verileri sorgula
    const result = await prisma.word.findMany({
      where: {
        categories: {
          some: {
            categoryId: category.id
          }
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        language: true
      }
    });
    expect(result.length).toBe(1);
    expect(result[0].text).toBe('test');
    expect(result[0].categories[0].category.name).toBe('Test Kategori');
    expect(result[0].language.code).toBe(language.code);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
}); 