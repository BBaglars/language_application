const request = require('supertest');
const app = require('../../../backend/app');
const { 
  createTestUser, 
  generateTestToken, 
  createTestLanguage,
  createTestStoryGenerationCriteria,
  clearTestData,
  prisma 
} = require('../../utils/helpers');

describe('Story Generation Criteria Endpoints', () => {
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

  it('Criteria oluşturulabiliyor', async () => {
    const criteria = {
      name: 'Test Criteria',
      parameters: {},
      userId: user.id
    };
    const response = await request(app)
      .post('/api/story-generation-criteria')
      .set('Authorization', `Bearer ${token}`)
      .send(criteria);
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty('criteria');
    expect(response.body.data.criteria).toMatchObject(criteria);
  });

  it('Zorunlu alan eksikse hata dönüyor', async () => {
    const response = await request(app)
      .post('/api/story-generation-criteria')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('Criteria listelenebiliyor', async () => {
    await createTestStoryGenerationCriteria(user.id, {
      name: 'Criteria 1',
      parameters: {}
    });
    await createTestStoryGenerationCriteria(user.id, {
      name: 'Criteria 2',
      parameters: {}
    });
    const response = await request(app)
      .get('/api/story-generation-criteria')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('criterias');
    expect(Array.isArray(response.body.data.criterias)).toBe(true);
    expect(response.body.data.criterias.length).toBe(2);
  });

  it('Criteria güncellenebiliyor', async () => {
    const criteria = await createTestStoryGenerationCriteria(user.id, {
      name: 'Test Criteria',
      parameters: {}
    });
    const updateData = {
      name: 'Updated Criteria',
      parameters: { updated: true }
    };
    const response = await request(app)
      .put(`/api/story-generation-criteria/${criteria.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('criteria');
    expect(response.body.data.criteria).toMatchObject(updateData);
  });

  it('Criteria silinebiliyor', async () => {
    const criteria = await createTestStoryGenerationCriteria(user.id, {
      name: 'Test Criteria',
      parameters: {}
    });
    const response = await request(app)
      .delete(`/api/story-generation-criteria/${criteria.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
    const deletedCriteria = await prisma.storyGenerationCriteria.findUnique({ where: { id: criteria.id } });
    expect(deletedCriteria).toBeNull();
  });

  it('Token yoksa 401 dönüyor', async () => {
    const response = await request(app)
      .get('/api/story-generation-criteria');
    expect(response.statusCode).toBe(401);
  });
}); 