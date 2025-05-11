const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class StoryController {
  // Tüm hikayeleri getir
  static async getAllStories(req, res, next) {
    try {
      const stories = await prisma.story.findMany({
        include: {
          language: true
        }
      });
      res.json({
        status: 'success',
        message: 'Hikayeler başarıyla listelendi',
        data: { stories }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Tek bir hikayeyi getir
  static async getStory(req, res, next) {
    try {
      const storyId = parseInt(req.params.id);
      const story = await prisma.story.findUnique({
        where: { id: storyId },
        include: {
          language: true
        }
      });

      if (!story) {
        return next(new AppError('Hikaye bulunamadı', 404));
      }

      res.json({
        status: 'success',
        message: 'Hikaye başarıyla getirildi',
        data: { story }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Yeni hikaye ekle
  static async createStory(req, res, next) {
    try {
      const { languageId, title, content, userId, difficultyLevel } = req.body;

      // Dil kontrolü
      const language = await prisma.language.findUnique({
        where: { id: languageId }
      });
      if (!language) {
        return next(new AppError('Dil bulunamadı', 404));
      }

      // Kullanıcı kontrolü
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        return next(new AppError('Kullanıcı bulunamadı', 404));
      }

      // difficultyLevel zorunlu
      if (!difficultyLevel) {
        return next(new AppError('Zorluk seviyesi zorunludur', 400));
      }

      const story = await prisma.story.create({
        data: {
          languageId,
          title,
          content,
          userId,
          difficultyLevel
        },
        include: {
          language: true
        }
      });

      res.status(201).json({
        status: 'success',
        message: 'Hikaye başarıyla oluşturuldu',
        data: { story }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Hikaye güncelle
  static async updateStory(req, res, next) {
    try {
      const storyId = parseInt(req.params.id);
      const { languageId, title, content, userId, difficultyLevel } = req.body;

      // Hikaye kontrolü
      const existingStory = await prisma.story.findUnique({
        where: { id: storyId }
      });
      if (!existingStory) {
        return next(new AppError('Hikaye bulunamadı', 404));
      }

      // Dil kontrolü
      if (languageId) {
        const language = await prisma.language.findUnique({
          where: { id: languageId }
        });
        if (!language) {
          return next(new AppError('Dil bulunamadı', 404));
        }
      }

      // Kullanıcı kontrolü
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        if (!user) {
          return next(new AppError('Kullanıcı bulunamadı', 404));
        }
      }

      const story = await prisma.story.update({
        where: { id: storyId },
        data: {
          languageId: languageId || undefined,
          title: title || undefined,
          content: content || undefined,
          userId: userId || undefined,
          difficultyLevel: difficultyLevel || undefined
        },
        include: {
          language: true
        }
      });

      res.json({
        status: 'success',
        message: 'Hikaye başarıyla güncellendi',
        data: { story }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Hikaye sil
  static async deleteStory(req, res, next) {
    try {
      const storyId = parseInt(req.params.id);

      // Hikaye kontrolü
      const story = await prisma.story.findUnique({
        where: { id: storyId }
      });
      if (!story) {
        return next(new AppError('Hikaye bulunamadı', 404));
      }

      await prisma.story.delete({
        where: { id: storyId }
      });

      res.status(204).send();
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Hikayeye kelime ekle
  static async addWordToStory(req, res, next) {
    try {
      const storyId = parseInt(req.params.id);
      const wordId = parseInt(req.params.wordId);

      const storyWord = await prisma.storyWord.create({
        data: {
          storyId,
          wordId
        },
        include: {
          word: true
        }
      });

      res.status(201).json(storyWord);
    } catch (error) {
      next(error);
    }
  }

  // Hikayeden kelime kaldır
  static async removeWordFromStory(req, res, next) {
    try {
      const storyId = parseInt(req.params.id);
      const wordId = parseInt(req.params.wordId);

      const storyWord = await prisma.storyWord.findUnique({
        where: {
          storyId_wordId: {
            storyId,
            wordId
          }
        }
      });

      if (!storyWord) {
        return next(new AppError('Hikaye ve kelime eşleşmesi bulunamadı', 404));
      }

      await prisma.storyWord.delete({
        where: {
          storyId_wordId: {
            storyId,
            wordId
          }
        }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StoryController; 