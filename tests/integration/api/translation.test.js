const request = require('supertest');
const app = require('../../../backend/app');
const { 
  createTestUser, 
  generateTestToken, 
  createTestLanguage, 
  createTestLanguagePair,
  createTestTranslation,
  clearTestData,
  prisma 
} = require('../../utils/helpers');

describe('Translation Endpoints', () => {
  let token;
  let user;
  let languagePair;

  beforeEach(async () => {
    await clearTestData();
    user = await createTestUser();
    token = generateTestToken(user);
    const sourceLanguage = await createTestLanguage({ name: 'İngilizce', code: 'en' });
    const targetLanguage = await createTestLanguage({ name: 'Türkçe', code: 'tr' });
    languagePair = await createTestLanguagePair(sourceLanguage.id, targetLanguage.id);
  });

  afterEach(async () => {
    await clearTestData();
  });

  it('Çeviri oluşturulabiliyor', async () => {
    const res = await request(app)
      .post('/api/translations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sourceText: 'Hello',
        targetText: 'Merhaba',
        languagePairId: languagePair.id
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('translation');
    expect(res.body.data.translation).toHaveProperty('sourceText', 'Hello');
    expect(res.body.data.translation).toHaveProperty('targetText', 'Merhaba');
  });

  it('Zorunlu alan eksikse hata dönüyor', async () => {
    const res = await request(app)
      .post('/api/translations')
      .set('Authorization', `Bearer ${token}`)
      .send({ sourceText: 'Hello' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('Çeviriler listelenebiliyor', async () => {
    await createTestTranslation(languagePair.id, { sourceText: 'Hello', targetText: 'Merhaba' });
    await createTestTranslation(languagePair.id, { sourceText: 'World', targetText: 'Dünya' });
    const res = await request(app)
      .get('/api/translations')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('translations');
    expect(Array.isArray(res.body.data.translations)).toBe(true);
    expect(res.body.data.translations.length).toBe(2);
  });

  it('Token yoksa 401 dönüyor', async () => {
    const res = await request(app)
      .get('/api/translations');
    expect(res.statusCode).toBe(401);
  });
}); 