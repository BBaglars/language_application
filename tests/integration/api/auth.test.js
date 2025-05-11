const request = require('supertest');
const app = require('../../../backend/app');
const { createTestUser, clearTestData } = require('../../utils/helpers');

describe('Authentication API', () => {
  let user;

  beforeEach(async () => {
    await clearTestData();
    user = await createTestUser();
  });

  afterEach(async () => {
    await clearTestData();
  });

  describe('POST /api/auth/login', () => {
    it('should return JWT token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          firebaseId: user.firebaseId
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          firebaseId: 'wrong-firebase-id'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/me', () => {
    it('should return user data for valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          firebaseId: user.firebaseId
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty('id', user.id);
      expect(response.body.data.user).toHaveProperty('email', user.email);
      expect(response.body.data.user).toHaveProperty('firebaseId', user.firebaseId);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });
}); 