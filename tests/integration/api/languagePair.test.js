const request = require('supertest');
const app = require('../../../backend/app');
const { 
  createTestUser, 
  generateTestToken, 
  createTestLanguage,
  createTestLanguagePair,
  clearTestData,
  prisma 
} = require('../../utils/helpers');

describe('LanguagePair Endpoints', () => {
  let token;
  let user;
  let sourceLanguage;
  let targetLanguage;

  beforeEach(async () => {
    await clearTestData();
    user = await createTestUser();
    token = generateTestToken(user);
    sourceLanguage = await createTestLanguage({ code: 'sl' });
    targetLanguage = await createTestLanguage({ code: 'tl' });
  });

  afterEach(async () => {
    await clearTestData();
  });

  it('Dil çifti oluşturulabiliyor', async () => {
    const res = await request(app)
      .post('/api/language-pairs')
      .set('Authorization', `Bearer ${token}`)
      .send({ sourceLanguageId: sourceLanguage.id, targetLanguageId: targetLanguage.id });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('sourceLanguageId', sourceLanguage.id);
    expect(res.body.data).toHaveProperty('targetLanguageId', targetLanguage.id);
  });

  it('Zorunlu alan eksikse hata dönüyor', async () => {
    const res = await request(app)
      .post('/api/language-pairs')
      .set('Authorization', `Bearer ${token}`)
      .send({ sourceLanguageId: sourceLanguage.id });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('Aynı dil çifti iki kez eklenemez', async () => {
    await createTestLanguagePair(sourceLanguage.id, targetLanguage.id);
    const res = await request(app)
      .post('/api/language-pairs')
      .set('Authorization', `Bearer ${token}`)
      .send({ sourceLanguageId: sourceLanguage.id, targetLanguageId: targetLanguage.id });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('Dil çiftleri listelenebiliyor', async () => {
    await createTestLanguagePair(sourceLanguage.id, targetLanguage.id);
    const res = await request(app)
      .get('/api/language-pairs')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('Token yoksa 401 dönüyor', async () => {
    const res = await request(app)
      .get('/api/language-pairs');
    expect(res.statusCode).toBe(401);
  });
}); 