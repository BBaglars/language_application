const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Dilleri oluştur
  const languages = await Promise.all([
    prisma.language.create({
      data: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
      },
    }),
    prisma.language.create({
      data: {
        code: 'tr',
        name: 'Turkish',
        nativeName: 'Türkçe',
      },
    }),
    prisma.language.create({
      data: {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
      },
    }),
    prisma.language.create({
      data: {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
      },
    }),
  ]);

  // Kategorileri oluştur
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Günlük Konuşma',
        description: 'Günlük hayatta sık kullanılan kelimeler ve ifadeler',
      },
    }),
    prisma.category.create({
      data: {
        name: 'İş Hayatı',
        description: 'İş ve kariyer ile ilgili kelimeler ve ifadeler',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Seyahat',
        description: 'Seyahat ve turizm ile ilgili kelimeler ve ifadeler',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Yemek',
        description: 'Yemek ve mutfak ile ilgili kelimeler ve ifadeler',
      },
    }),
  ]);

  // Örnek kelimeler oluştur
  const words = await Promise.all([
    // İngilizce kelimeler
    prisma.word.create({
      data: {
        text: 'hello',
        languageId: languages[0].id, // İngilizce
        letterCount: 5,
        difficultyLevel: 'A1',
      },
    }),
    prisma.word.create({
      data: {
        text: 'world',
        languageId: languages[0].id,
        letterCount: 5,
        difficultyLevel: 'A1',
      },
    }),
    // Türkçe kelimeler
    prisma.word.create({
      data: {
        text: 'merhaba',
        languageId: languages[1].id, // Türkçe
        letterCount: 7,
        difficultyLevel: 'A1',
      },
    }),
    prisma.word.create({
      data: {
        text: 'dünya',
        languageId: languages[1].id,
        letterCount: 5,
        difficultyLevel: 'A1',
      },
    }),
  ]);

  // Kelime-Kategori ilişkilerini oluştur
  await Promise.all([
    prisma.wordCategory.create({
      data: {
        wordId: words[0].id, // hello
        categoryId: categories[0].id, // Günlük Konuşma
      },
    }),
    prisma.wordCategory.create({
      data: {
        wordId: words[1].id, // world
        categoryId: categories[0].id, // Günlük Konuşma
      },
    }),
    prisma.wordCategory.create({
      data: {
        wordId: words[2].id, // merhaba
        categoryId: categories[0].id, // Günlük Konuşma
      },
    }),
    prisma.wordCategory.create({
      data: {
        wordId: words[3].id, // dünya
        categoryId: categories[0].id, // Günlük Konuşma
      },
    }),
  ]);

  // Dil çiftleri oluştur
  const languagePairs = await Promise.all([
    prisma.languagePair.create({
      data: {
        sourceLanguageId: languages[0].id, // İngilizce
        targetLanguageId: languages[1].id, // Türkçe
      },
    }),
    prisma.languagePair.create({
      data: {
        sourceLanguageId: languages[1].id, // Türkçe
        targetLanguageId: languages[0].id, // İngilizce
      },
    }),
  ]);

  // Çevirileri oluştur
  await Promise.all([
    prisma.translation.create({
      data: {
        languagePairId: languagePairs[0].id,
        sourceWordId: words[0].id, // hello
        targetWordId: words[2].id, // merhaba
      },
    }),
    prisma.translation.create({
      data: {
        languagePairId: languagePairs[0].id,
        sourceWordId: words[1].id, // world
        targetWordId: words[3].id, // dünya
      },
    }),
  ]);

  console.log('Seed verileri başarıyla oluşturuldu!');
}

main()
  .catch((e) => {
    console.error('Seed işlemi sırasında hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 