const { PrismaClient } = require('@prisma/client');
const geminiService = require('../services/gemini');
const prisma = new PrismaClient();

const generationController = {
  async generateText(req, res) {
    try {
      const {
        language,
        difficultyLevel,
        type,
        length,
        purpose,
        categoryId,
        wordCount = 5,
        ageGroup
      } = req.body;

      // Kelimeleri seç
      const words = await prisma.word.findMany({
        where: {
          language: {
            code: language
          },
          difficultyLevel,
          categories: {
            some: {
              categoryId: categoryId
            }
          }
        },
        take: wordCount
      });

      if (words.length === 0) {
        return res.status(400).json({
          error: 'Belirtilen kriterlere uygun kelime bulunamadı'
        });
      }

      // Metni üret
      const generatedText = await geminiService.generateStory(
        'Lütfen bu kelimeleri kullanarak bir metin oluştur.',
        {
          language,
          difficulty_level: difficultyLevel,
          type,
          length,
          purpose,
          ageGroup,
          keywords: words.map(w => w.text)
        }
      );

      // Markdown bloklarını temizle
      let cleanedText = generatedText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      // JSON formatına çevir
      const parsedText = JSON.parse(cleanedText);

      // Veritabanına kaydet
      const story = await prisma.story.create({
        data: {
          title: parsedText.title,
          content: parsedText.content,
          difficultyLevel,
          languageId: (await prisma.language.findFirst({
            where: { code: language }
          })).id,
          userId: req.user.id
        }
      });

      // Kullanılan kelimeleri kaydet
      await Promise.all(
        parsedText.usedWords.map(async (wordText, index) => {
          const word = await prisma.word.findFirst({
            where: { text: wordText }
          });
          
          if (word) {
            await prisma.storyWord.create({
              data: {
                storyId: story.id,
                wordId: word.id,
                order: index
              }
            });
          }
        })
      );

      res.json({
        success: true,
        story: {
          ...story,
          usedWords: parsedText.usedWords
        }
      });
    } catch (error) {
      console.error('Generation Error:', error);
      res.status(500).json({
        error: 'Metin üretilirken bir hata oluştu'
      });
    }
  }
};

module.exports = generationController; 