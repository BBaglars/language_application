const request = require('supertest');
const app = require('../app');
const logger = require('../utils/logger');

describe('API Endpoint Testleri', () => {
    let testToken;

    beforeAll(async () => {
        // Test kullanıcısı oluştur ve token al
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Test123!',
                username: 'testuser'
            });
        
        testToken = response.body.data.token;
    });

    it('Kullanıcı kaydı yapabilmeli', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'newuser@example.com',
                password: 'Test123!',
                username: 'newuser'
            });

        expect(response.status).toBe(201);
        expect(response.body.data.user).toBeTruthy();
    });

    it('Kelime ekleyebilmeli', async () => {
        const response = await request(app)
            .post('/api/words')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                word: 'test',
                language_id: 1,
                difficulty_level: 'A1'
            });

        expect(response.status).toBe(201);
        expect(response.body.data.word).toBe('test');
    });

    it('Oyun başlatabilmeli', async () => {
        const response = await request(app)
            .post('/api/games/start')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                game_type_id: 1,
                language_id: 1
            });

        expect(response.status).toBe(200);
        expect(response.body.data.session_id).toBeTruthy();
    });
}); 