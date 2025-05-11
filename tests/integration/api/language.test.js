const request = require('supertest');
const app = require('../../../backend/app');
const { 
  createTestUser, 
  generateTestToken, 
  createTestLanguage,
  clearTestData,
  prisma 
} = require('../../utils/helpers');

describe('Language Endpoints', () => {
  let token;
  let user;

  beforeEach(async () => {
    await clearTestData();
    user = await createTestUser();
    token = generateTestToken(user);
  });

  afterEach(async () => {
    await clearTestData();
  });

  it('Dil oluşturulabiliyor', async () => {
    const res = await request(app)
      .post('/api/languages')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'İngilizce', code: 'en' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.language).toHaveProperty('name', 'İngilizce');
    expect(res.body.data.language).toHaveProperty('code', 'en');
  });

  it('Zorunlu alan eksikse hata dönüyor', async () => {
    const res = await request(app)
      .post('/api/languages')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'İngilizce' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('Aynı kodla iki dil eklenemez', async () => {
    await createTestLanguage({ name: 'İngilizce', code: 'en' });
    const res = await request(app)
      .post('/api/languages')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'English', code: 'en' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('Dil listelenebiliyor', async () => {
    await createTestLanguage({ name: 'İngilizce', code: 'en' });
    await createTestLanguage({ name: 'Türkçe', code: 'tr' });
    const res = await request(app)
      .get('/api/languages')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.languages)).toBe(true);
    expect(res.body.data.languages.length).toBe(2);
  });

  it('Dil güncellenebiliyor', async () => {
    const language = await createTestLanguage({ name: 'İngilizce', code: 'en' });
    const res = await request(app)
      .patch(`/api/languages/${language.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'English', code: 'en' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.language).toHaveProperty('name', 'English');
  });

  it('Dil silinebiliyor', async () => {
    const language = await createTestLanguage({ name: 'İngilizce', code: 'en' });
    const res = await request(app)
      .delete(`/api/languages/${language.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('Token yoksa 401 dönüyor', async () => {
    const res = await request(app)
      .get('/api/languages');
    expect(res.statusCode).toBe(401);
  });
});