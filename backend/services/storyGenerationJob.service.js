const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError } = require('../utils/errors.js');

const prisma = new PrismaClient();

class StoryGenerationJobService {
  async createJob(data) {
    try {
      const job = await prisma.storyGenerationJob.create({
        data: {
          status: data.status || 'PENDING',
          story: data.storyId ? {
            connect: { id: data.storyId }
          } : undefined,
          criteria: {
            connect: { id: data.criteriaId }
          },
          user: data.userId ? {
            connect: { id: data.userId }
          } : undefined
        },
        include: {
          story: {
            include: {
              language: true
            }
          },
          criteria: true
        }
      });
      return job;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ValidationError('Bu iş zaten mevcut');
      }
      throw error;
    }
  }

  async getJobById(id) {
    const job = await prisma.storyGenerationJob.findUnique({
      where: { id },
      include: {
        story: {
          include: {
            language: true
          }
        },
        criteria: true
      }
    });

    if (!job) {
      throw new NotFoundError('İş bulunamadı');
    }

    return job;
  }

  async getJobsByUser(userId, filters = {}) {
    const { status, storyId } = filters;

    const where = {
      userId,
      ...(status && { status }),
      ...(storyId && { storyId })
    };

    return prisma.storyGenerationJob.findMany({
      where,
      include: {
        story: {
          include: {
            language: true
          }
        },
        criteria: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateJob(id, data, userId) {
    const job = await this.getJobById(id);

    if (job.userId !== userId) {
      throw new ValidationError('Bu işi düzenleme yetkiniz yok');
    }

    return prisma.storyGenerationJob.update({
      where: { id },
      data: {
        status: data.status,
        result: data.result,
        ...(data.storyId && { storyId: data.storyId }),
        ...(data.criteriaId && { criteriaId: data.criteriaId })
      },
      include: {
        story: {
          include: {
            language: true
          }
        },
        criteria: true
      }
    });
  }

  async deleteJob(id, userId) {
    const job = await this.getJobById(id);

    if (job.userId !== userId) {
      throw new ValidationError('Bu işi silme yetkiniz yok');
    }

    await prisma.storyGenerationJob.delete({
      where: { id }
    });
  }

  async getJobsByStory(storyId, userId) {
    return prisma.storyGenerationJob.findMany({
      where: {
        storyId,
        userId
      },
      include: {
        criteria: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getJobsByStatus(status, userId) {
    return prisma.storyGenerationJob.findMany({
      where: {
        status,
        userId
      },
      include: {
        story: {
          include: {
            language: true
          }
        },
        criteria: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getJobWithDetails(id, userId) {
    const job = await prisma.storyGenerationJob.findFirst({
      where: {
        id,
        userId
      },
      include: {
        story: {
          include: {
            language: true
          }
        },
        criteria: true
      }
    });

    if (!job) {
      throw new NotFoundError('İş bulunamadı');
    }

    return job;
  }
}

module.exports = StoryGenerationJobService;