const { prisma } = require('../../backend/config');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../backend/config/config');
const { v4: uuidv4 } = require('uuid');

const generateTestUser = async () => {
  const unique = uuidv4();
  const user = await prisma.user.create({
    data: {
      email: `test${unique}@example.com`,
      name: `Test User ${unique}`,
      password: 'test1234',
      role: 'USER',
    },
  });
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '30d' }
  );
  return { ...user, token };
};

const generateTestWord = async () => {
  const language = await prisma.language.create({
    data: {
      name: `Test Language ${Date.now()}`,
      code: `TL${Date.now()}`
    }
  });

  return prisma.word.create({
    data: {
      text: `Test Word ${Date.now()}`,
      translation: `Test Translation ${Date.now()}`,
      languageId: language.id
    }
  });
};

const generateTestStory = async (userId) => {
  const language = await prisma.language.create({
    data: {
      name: `Test Language ${Date.now()}`,
      code: `TL${Date.now()}`
    }
  });

  return prisma.story.create({
    data: {
      title: `Test Story ${Date.now()}`,
      content: `Test Content ${Date.now()}`,
      languageId: language.id,
      userId: userId
    }
  });
};

const generateTestCriteria = async (userId) => {
  return prisma.storyGenerationCriteria.create({
    data: {
      userId: userId,
      difficultyLevel: 'A1',
      topic: 'Test Topic',
      wordCount: 100
    }
  });
};

module.exports = {
  generateTestUser,
  generateTestWord,
  generateTestStory,
  generateTestCriteria
}; 