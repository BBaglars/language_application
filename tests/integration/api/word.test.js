const request = require('supertest');
const app = require('../../../backend/app');
const { 
  createTestUser, 
  generateTestToken, 
  createTestLanguage,
  createTestCategory,
  createTestWord,
  clearTestData,
  prisma 
} = require('../../utils/helpers');

describe('Word Endpoints', () => {
  let token;
  let user;
  let language;
  let category;

  beforeEach(async () => {
    await clearTestData();
    user = await createTestUser();
    token = generateTestToken(user);
    language = await createTestLanguage({ name: 'İngilizce', code: 'en' });
    category = await createTestCategory({ name: 'Günlük Konuşma', description: 'Günlük hayatta kullanılan kelimeler' });
  });

  afterEach(async () => {
    await clearTestData();
  });

  it('Kelime oluşturulabiliyor', async () => {
    const res = await request(app)
      .post('/api/words')
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: 'hello',
        meaning: 'merhaba',
        example: 'Hello, how are you?',
        languageId: language.id,
        difficultyLevel: 'A1'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.word).toHaveProperty('text', 'hello');
  });

  it('Zorunlu alan eksikse hata dönüyor', async () => {
    const res = await request(app)
      .post('/api/words')
      .set('Authorization', `Bearer ${token}`)
      .send({ meaning: 'merhaba' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('Kelime listelenebiliyor', async () => {
    await createTestWord(language.id, { text: 'hello', meaning: 'merhaba' });
    await createTestWord(language.id, { text: 'world', meaning: 'dünya' });
    const res = await request(app)
      .get('/api/words')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.words)).toBe(true);
    expect(res.body.data.words.length).toBe(2);
  });

  it('Kelime güncellenebiliyor', async () => {
    const word = await createTestWord(language.id, { text: 'hello', meaning: 'merhaba' });
    const res = await request(app)
      .patch(`/api/words/${word.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ meaning: 'selam' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.word).toHaveProperty('meaning', 'selam');
  });

  it('Kelime silinebiliyor', async () => {
    const word = await createTestWord(language.id, { text: 'hello', meaning: 'merhaba' });
    const res = await request(app)
      .delete(`/api/words/${word.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });

  it('Token yoksa 401 dönüyor', async () => {
    const res = await request(app)
      .get('/api/words');
    expect(res.statusCode).toBe(401);
  });
}); 