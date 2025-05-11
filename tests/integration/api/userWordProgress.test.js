const request = require('supertest');
const app = require('../../../backend/app');
const { prisma } = require('../../../backend/config');
const { generateTestUser, createTestWord, createTestLanguage } = require('../../utils/helpers');

let testUser;
let testWord;
let testLanguage;
let authToken;

beforeAll(async () => {
  testUser = await generateTestUser();
  testLanguage = await createTestLanguage();
  testWord = await createTestWord(testLanguage.id);
  authToken = testUser.token;
});

afterAll(async () => {
  await prisma.userWordProgress.deleteMany();
  await prisma.wordCategory.deleteMany();
  await prisma.word.deleteMany();
  await prisma.category.deleteMany();
  await prisma.language.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('UserWordProgress API', () => {
  describe('POST /api/user-word-progress', () => {
    let localTestWord;
    beforeAll(async () => {
      localTestWord = await createTestWord(testLanguage.id);
    });
    it('should create a new word progress entry', async () => {
      const response = await request(app)
        .post('/api/user-word-progress')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          wordId: localTestWord.id,
          proficiencyLevel: 'A1',
          reviewCount: 0
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.userId).toBe(testUser.id);
      expect(response.body.data.wordId).toBe(localTestWord.id);
      expect(response.body.data.proficiencyLevel).toBe('A1');
      expect(response.body.data.reviewCount).toBe(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/user-word-progress')
        .send({
          wordId: testWord.id,
          proficiencyLevel: 'A1',
          reviewCount: 0
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/user-word-progress', () => {
    it('should get all word progress entries for user', async () => {
      const response = await request(app)
        .get('/api/user-word-progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/user-word-progress');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/user-word-progress/:id', () => {
    let progressId;

    beforeAll(async () => {
      const progress = await prisma.userWordProgress.create({
        data: {
          userId: testUser.id,
          wordId: testWord.id,
          proficiencyLevel: 'A1',
          reviewCount: 0,
          lastReviewedAt: new Date()
        }
      });
      progressId = progress.id;
    });

    it('should get a specific word progress entry', async () => {
      const response = await request(app)
        .get(`/api/user-word-progress/${progressId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(progressId);
      expect(response.body.data.userId).toBe(testUser.id);
      expect(response.body.data.wordId).toBe(testWord.id);
    });

    it('should return 404 for non-existent progress', async () => {
      const response = await request(app)
        .get('/api/user-word-progress/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/user-word-progress/${progressId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/user-word-progress/:id', () => {
    let progressId;
    let patchTestWord;

    beforeAll(async () => {
      patchTestWord = await createTestWord(testLanguage.id);
      const progress = await prisma.userWordProgress.create({
        data: {
          userId: testUser.id,
          wordId: patchTestWord.id,
          proficiencyLevel: 'A1',
          reviewCount: 0,
          lastReviewedAt: new Date()
        }
      });
      progressId = progress.id;
    });

    it('should update word progress', async () => {
      const response = await request(app)
        .patch(`/api/user-word-progress/${progressId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          proficiencyLevel: 'A2',
          reviewCount: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.data.proficiencyLevel).toBe('A2');
      expect(response.body.data.reviewCount).toBe(1);
    });

    it('should return 404 for non-existent progress', async () => {
      const response = await request(app)
        .patch('/api/user-word-progress/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          proficiencyLevel: 'A2',
          reviewCount: 1
        });

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch(`/api/user-word-progress/${progressId}`)
        .send({
          proficiencyLevel: 'A2',
          reviewCount: 1
        });

      expect(response.status).toBe(401);
    });
  });
}); 