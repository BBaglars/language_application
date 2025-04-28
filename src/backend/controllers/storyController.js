const prisma = require('../config/database');
const { ValidationError, NotFoundError } = require('../utils/errors');

class StoryController {
  async getAllStories(req, res, next) {
    try {
      const stories = await prisma.generatedText.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      res.json(stories);
    } catch (error) {
      next(error);
    }
  }

  async getStoryById(req, res, next) {
    try {
      const { id } = req.params;
      const story = await prisma.generatedText.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!story) {
        throw new NotFoundError('Hikaye bulunamadı');
      }

      res.json(story);
    } catch (error) {
      next(error);
    }
  }

  async createStory(req, res, next) {
    try {
      const { content, level } = req.body;
      const userId = req.user.id;

      const story = await prisma.generatedText.create({
        data: {
          content,
          level,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      res.status(201).json(story);
    } catch (error) {
      next(error);
    }
  }

  async updateStory(req, res, next) {
    try {
      const { id } = req.params;
      const { content, level } = req.body;
      const userId = req.user.id;

      const story = await prisma.generatedText.update({
        where: { id: parseInt(id) },
        data: {
          content,
          level,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      res.json(story);
    } catch (error) {
      next(error);
    }
  }

  async deleteStory(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.generatedText.delete({
        where: { id: parseInt(id) }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getUserStories(req, res, next) {
    try {
      const userId = req.user.id;

      const stories = await prisma.generatedText.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      res.json(stories);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StoryController(); 