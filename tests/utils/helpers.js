const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../backend/app');

const prisma = new PrismaClient();

// Test verilerini temizleme
const clearTestData = async () => {
  await prisma.storyGenerationJob.deleteMany();
  await prisma.storyGenerationCriteria.deleteMany();
  await prisma.userWordProgress.deleteMany();
  await prisma.wordCategory.deleteMany();
  await prisma.word.deleteMany();
  await prisma.story.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.languagePair.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.language.deleteMany();
};

// Kullanıcı oluşturma
const createTestUser = async (userData = {}) => {
  const unique = uuidv4();
  const defaultUser = {
    email: `test-${unique}@example.com`,
    name: 'Test User',
    firebaseId: `test-firebase-id-${unique}`,
    ...userData
  };
  const response = await request(app)
    .post('/api/auth/register')
    .send(defaultUser);
  
  if (!response.body.data || !response.body.data.user) {
    throw new Error('Register response format is invalid');
  }
  
  return response.body.data.user;
};

// JWT token oluşturma
const generateTestToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '30d' }
  );
};

// Dil oluşturma
const createTestLanguage = async (data = {}) => {
  const unique = uuidv4();
  const defaultData = {
    name: `Test Language ${unique}`,
    code: `tl${unique.slice(0, 4)}`,
    ...data
  };
  return await prisma.language.create({
    data: defaultData
  });
};

// Dil çifti oluşturma
const createTestLanguagePair = async (sourceLanguageId, targetLanguageId, data = {}) => {
  const unique = uuidv4();
  const defaultData = {
    sourceLanguageId,
    targetLanguageId,
    ...data
  };
  return await prisma.languagePair.create({
    data: defaultData
  });
};

// Kategori oluşturma
const createTestCategory = async (data = {}) => {
  const unique = uuidv4();
  const defaultData = {
    name: `Test Category ${unique}`,
    description: 'Açıklama',
    ...data
  };
  return await prisma.category.create({
    data: defaultData
  });
};

// Kelime oluşturma
const createTestWord = async (languageId, data = {}) => {
  const unique = uuidv4();
  const defaultData = {
    text: `word${unique}`,
    meaning: 'anlam',
    languageId,
    letterCount: 5,
    difficultyLevel: 'A1',
    ...data
  };
  return await prisma.word.create({
    data: defaultData
  });
};

// Çeviri oluşturma
const createTestTranslation = async (languagePairId, data = {}) => {
  const unique = uuidv4();
  const defaultData = {
    sourceText: `source-${unique}`,
    targetText: `target-${unique}`,
    languagePairId: parseInt(languagePairId),
    ...data
  };
  return await prisma.translation.create({
    data: defaultData
  });
};

// Hikaye oluşturma
const createTestStory = async (languageId, userId, data = {}) => {
  const unique = uuidv4();
  const defaultData = {
    title: `Test Story ${unique}`,
    content: `Test content ${unique}`,
    difficultyLevel: 'A1',
    languageId: parseInt(languageId),
    userId: parseInt(userId),
    ...data
  };
  return await prisma.story.create({
    data: defaultData
  });
};

// Hikaye üretim kriterleri oluşturma
const createTestStoryGenerationCriteria = async (userId, data = {}) => {
  return prisma.storyGenerationCriteria.create({
    data: {
      name: data.name || 'Test Criteria',
      description: data.description || 'Test Description',
      parameters: data.parameters || {},
      userId: userId
    }
  });
};

// Hikaye üretim işi oluşturma
const createTestStoryGenerationJob = async (storyId, criteriaId, userId, data = {}) => {
  const defaultData = {
    status: 'PENDING',
    storyId: parseInt(storyId),
    criteriaId: parseInt(criteriaId),
    userId: parseInt(userId),
    ...data
  };
  return await prisma.storyGenerationJob.create({
    data: defaultData
  });
};

// Kullanıcı kelime ilerlemesi oluşturma
const createTestUserWordProgress = async (userId, wordId, data = {}) => {
  const defaultData = {
    userId: parseInt(userId),
    wordId: parseInt(wordId),
    proficiencyLevel: 'A1',
    reviewCount: 0,
    lastReviewedAt: new Date(),
    ...data
  };
  return await prisma.userWordProgress.create({
    data: defaultData
  });
};

const generateTestUser = async () => {
  const unique = uuidv4();
  const user = await prisma.user.create({
    data: {
      email: `test${unique}@example.com`,
      name: `Test User ${unique}`,
      role: 'USER',
      firebaseId: `test-firebase-id-${unique}`
    },
  });
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '30d' }
  );
  return { ...user, token };
};

module.exports = {
  prisma,
  clearTestData,
  createTestUser,
  generateTestToken,
  createTestLanguage,
  createTestLanguagePair,
  createTestCategory,
  createTestWord,
  createTestTranslation,
  createTestStory,
  createTestStoryGenerationCriteria,
  createTestStoryGenerationJob,
  createTestUserWordProgress,
  generateTestUser
};