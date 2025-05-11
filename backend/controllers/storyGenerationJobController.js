const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class StoryGenerationJobController {
  // Tüm işleri getir
  static async getAllJobs(req, res, next) {
    try {
      const jobs = await prisma.storyGenerationJob.findMany({
        include: {
          criteria: true,
          story: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      res.json({
        status: 'success',
        message: 'İşler başarıyla listelendi',
        data: { jobs }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // İş detayını getir
  static async getJobById(req, res, next) {
    try {
      const job = await prisma.storyGenerationJob.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          criteria: true,
          story: true
        }
      });

      if (!job) {
        return next(new AppError('İş bulunamadı', 404));
      }

      res.json({
        status: 'success',
        message: 'İş başarıyla getirildi',
        data: { job }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Yeni iş oluştur
  static async createJob(req, res, next) {
    try {
      const { storyId, criteriaId, userId, status } = req.body;

      if (!storyId || !criteriaId || !userId) {
        return next(new AppError('storyId, criteriaId ve userId zorunludur', 400));
      }

      // İlişkili kayıtlar var mı kontrol et
      const story = await prisma.story.findUnique({ where: { id: parseInt(storyId) } });
      if (!story) {
        return next(new AppError('Hikaye bulunamadı', 404));
      }
      const criteria = await prisma.storyGenerationCriteria.findUnique({ where: { id: parseInt(criteriaId) } });
      if (!criteria) {
        return next(new AppError('Kriter bulunamadı', 404));
      }
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      if (!user) {
        return next(new AppError('Kullanıcı bulunamadı', 404));
      }

      const job = await prisma.storyGenerationJob.create({
        data: {
          storyId: parseInt(storyId),
          criteriaId: parseInt(criteriaId),
          userId: parseInt(userId),
          status: status || 'PENDING'
        },
        include: {
          criteria: true,
          story: true
        }
      });

      res.status(201).json({
        status: 'success',
        message: 'İş başarıyla oluşturuldu',
        data: { job }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return next(new AppError('Bu iş zaten mevcut', 400));
      }
      next(new AppError(error.message, 500));
    }
  }

  // İş güncelle
  static async updateJob(req, res, next) {
    try {
      const { status } = req.body;
      const id = parseInt(req.params.id);

      // Önce job var mı kontrol et
      const existingJob = await prisma.storyGenerationJob.findUnique({ where: { id } });
      if (!existingJob) {
        return next(new AppError('İş bulunamadı', 404));
      }

      const job = await prisma.storyGenerationJob.update({
        where: { id },
        data: { status },
        include: { criteria: true, story: true }
      });

      res.json({
        status: 'success',
        message: 'İş başarıyla güncellendi',
        data: { job }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // İş sil
  static async deleteJob(req, res, next) {
    try {
      await prisma.storyGenerationJob.delete({
        where: { id: parseInt(req.params.id) }
      });

      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return next(new AppError('İş bulunamadı', 404));
      }
      next(new AppError(error.message, 500));
    }
  }

  // Kullanıcının işlerini getir
  static async getUserJobs(req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppError('Kullanıcı kimliği bulunamadı', 401));
      }

      const jobs = await prisma.storyGenerationJob.findMany({
        where: { userId: parseInt(userId) },
        include: {
          criteria: true,
          story: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        status: 'success',
        message: 'Kullanıcının işleri başarıyla listelendi',
        data: { jobs }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }

  // Bekleyen işleri getir
  static async getPendingJobs(req, res, next) {
    try {
      const jobs = await prisma.storyGenerationJob.findMany({
        where: {
          status: 'PENDING'
        },
        include: {
          criteria: true,
          story: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      res.json({
        status: 'success',
        message: 'Bekleyen işler başarıyla listelendi',
        data: { jobs }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = StoryGenerationJobController;