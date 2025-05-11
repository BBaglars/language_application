const request = require('supertest');
const app = require('../../../backend/app');
const { 
  createTestUser, 
  generateTestToken, 
  createTestLanguage,
  createTestStory,
  clearTestData,
  prisma 
} = require('../../utils/helpers');

describe('Story Endpoints', () => {
  let token;
  let user;
  let language;

  beforeEach(async () => {
    await clearTestData();
    user = await createTestUser();
    token = generateTestToken(user);
    language = await createTestLanguage();
  });

  afterEach(async () => {
    await clearTestData();
  });

  it('Hikaye oluşturulabiliyor', async () => {
    const res = await request(app)
      .post('/api/stories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Story',
        content: 'This is a test story.',
        languageId: language.id,
        userId: user.id,
        difficultyLevel: 'A1'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.story).toHaveProperty('title', 'Test Story');
    expect(res.body.data.story).toHaveProperty('content', 'This is a test story.');
  });

  it('Zorunlu alan eksikse hata dönüyor', async () => {
    const res = await request(app)
      .post('/api/stories')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Story' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('Hikayeler listelenebiliyor', async () => {
    await createTestStory(language.id, user.id, {
      title: 'Story 1',
      content: 'Content 1',
      difficultyLevel: 'A1'
    });
    await createTestStory(language.id, user.id, {
      title: 'Story 2',
      content: 'Content 2',
      difficultyLevel: 'B1'
    });
    const res = await request(app)
      .get('/api/stories')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.stories)).toBe(true);
    expect(res.body.data.stories.length).toBe(2);
  });

  it('Hikaye güncellenebiliyor', async () => {
    const story = await createTestStory(language.id, user.id, {
      title: 'Test Story',
      content: 'This is a test story.',
      difficultyLevel: 'A1'
    });
    const res = await request(app)
      .patch(`/api/stories/${story.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Story', content: 'Updated content.' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.story).toHaveProperty('title', 'Updated Story');
    expect(res.body.data.story).toHaveProperty('content', 'Updated content.');
  });

  it('Hikaye silinebiliyor', async () => {
    const story = await createTestStory(language.id, user.id, {
      title: 'Test Story',
      content: 'This is a test story.',
      difficultyLevel: 'A1'
    });
    const res = await request(app)
      .delete(`/api/stories/${story.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });

  it('Token yoksa 401 dönüyor', async () => {
    const res = await request(app)
      .get('/api/stories');
    expect(res.statusCode).toBe(401);
  });
}); 