const request = require('supertest');
const app = require('../../../backend/app');
const { 
  createTestUser, 
  generateTestToken, 
  createTestLanguage,
  createTestCategory,
  clearTestData,
  prisma 
} = require('../../utils/helpers');

describe('Category Endpoints', () => {
  let token;
  let user;
  let language;

  beforeEach(async () => {
    await clearTestData();
    user = await createTestUser();
    token = generateTestToken(user);
    language = await createTestLanguage({ name: 'İngilizce', code: 'en' });
  });

  afterEach(async () => {
    await clearTestData();
  });

  it('Kategori oluşturulabiliyor', async () => {
    const categoryName = `Test Category ${Date.now()}`;
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: categoryName, description: 'Açıklama' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.category).toHaveProperty('name', categoryName);
  });

  it('Zorunlu alan eksikse hata dönüyor', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Açıklama' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('Aynı isimle iki kategori eklenemez', async () => {
    const uniqueName = `Test Category ${Date.now()}`;
    await createTestCategory({ name: uniqueName });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: uniqueName, description: 'Açıklama' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('Kategori listelenebiliyor', async () => {
    await createTestCategory({ name: `Günlük Konuşma ${Date.now()}`, description: 'Günlük hayatta kullanılan kelimeler' });
    await createTestCategory({ name: `İş Hayatı ${Date.now()}`, description: 'İş hayatında kullanılan kelimeler' });
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
    expect(res.body.data.categories.length).toBe(2);
  });

  it('Kategori güncellenebiliyor', async () => {
    const category = await createTestCategory({ name: `Günlük Konuşma ${Date.now()}`, description: 'Açıklama' });
    console.log('TEST LOG: Oluşturulan kategori:', category);
    const res = await request(app)
      .patch(`/api/categories/${category.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Günlük Hayat', description: 'Güncellenmiş açıklama' });
    console.log('TEST LOG: Güncelleme isteği atılan kategori id:', category.id, 'Response status:', res.statusCode);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.category).toHaveProperty('name', 'Günlük Hayat');
  });

  it('Kategori silinebiliyor', async () => {
    const category = await createTestCategory();
    const res = await request(app)
      .delete(`/api/categories/${category.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });

  it('Token yoksa 401 dönüyor', async () => {
    const res = await request(app)
      .get('/api/categories');
    expect(res.statusCode).toBe(401);
  });
});