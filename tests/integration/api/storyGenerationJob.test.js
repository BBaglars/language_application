const request = require('supertest');
const app = require('../../../backend/app');
const { 
  createTestUser, 
  generateTestToken, 
  createTestLanguage,
  createTestStory,
  createTestStoryGenerationCriteria,
  createTestStoryGenerationJob,
  clearTestData,
  prisma 
} = require('../../utils/helpers');

describe('Story Generation Job Endpoints', () => {
  let token;
  let user;
  let language;
  let story;
  let criteria;

  beforeEach(async () => {
    await clearTestData();
    user = await createTestUser();
    token = generateTestToken(user);
    language = await createTestLanguage();
    story = await createTestStory(language.id, user.id);
    criteria = await createTestStoryGenerationCriteria(user.id);
  });

  afterEach(async () => {
    await clearTestData();
  });

  it('Job oluşturulabiliyor', async () => {
    const jobData = {
      storyId: story.id,
      criteriaId: criteria.id,
      userId: user.id,
      status: 'PENDING'
    };
    const response = await request(app)
      .post('/api/story-generation-jobs')
      .set('Authorization', `Bearer ${token}`)
      .send(jobData);
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty('job');
    expect(response.body.data.job).toMatchObject(jobData);
  });

  it('Zorunlu alan eksikse hata dönüyor', async () => {
    const response = await request(app)
      .post('/api/story-generation-jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('Job listelenebiliyor', async () => {
    await createTestStoryGenerationJob(story.id, criteria.id, user.id, { status: 'PENDING' });
    await createTestStoryGenerationJob(story.id, criteria.id, user.id, { status: 'COMPLETED' });
    const response = await request(app)
      .get('/api/story-generation-jobs')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('jobs');
    expect(Array.isArray(response.body.data.jobs)).toBe(true);
    expect(response.body.data.jobs.length).toBe(2);
  });

  it('Job güncellenebiliyor', async () => {
    const job = await createTestStoryGenerationJob(story.id, criteria.id, user.id, { status: 'PENDING' });
    const response = await request(app)
      .put(`/api/story-generation-jobs/${job.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('job');
    expect(response.body.data.job).toHaveProperty('status', 'COMPLETED');
  });

  it('Job silinebiliyor', async () => {
    const job = await createTestStoryGenerationJob(story.id, criteria.id, user.id, { status: 'PENDING' });
    const response = await request(app)
      .delete(`/api/story-generation-jobs/${job.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });

  it('Token yoksa 401 dönüyor', async () => {
    const response = await request(app)
      .get('/api/story-generation-jobs');
    expect(response.statusCode).toBe(401);
  });
}); 