const jwt = require('jsonwebtoken');
const auth = require('../../../src/backend/middleware/auth');
const { AppError } = require('../../../src/backend/utils/errors');
const { pool } = require('../../../src/backend/db');

jest.mock('../../../src/backend/db', () => ({
    pool: {
        query: jest.fn()
    }
}));

describe('Auth Middleware Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            user: null
        };
        res = {};
        next = jest.fn();
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = 'test-secret';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('token yoksa 401 hatası dönmeli', async () => {
        process.env.NODE_ENV = 'development';
        await auth(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe('Token bulunamadı');
        expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('geçersiz token için 401 hatası dönmeli', async () => {
        process.env.NODE_ENV = 'development';
        req.headers.authorization = 'Bearer invalid-token';
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new jwt.JsonWebTokenError();
        });

        await auth(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe('Geçersiz token');
        expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('test ortamında kullanıcı kontrolünü atlamalı', async () => {
        process.env.NODE_ENV = 'test';
        await auth(req, res, next);

        expect(req.user).toEqual({ id: 1 });
        expect(next).toHaveBeenCalled();
    });

    it('kullanıcı bulunamazsa 401 hatası dönmeli', async () => {
        process.env.NODE_ENV = 'development';
        req.headers.authorization = 'Bearer valid-token';
        jest.spyOn(jwt, 'verify').mockReturnValue({ id: 1 });
        pool.query.mockResolvedValue({ rows: [] });

        await auth(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe('Kullanıcı bulunamadı');
        expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('geçerli token ve kullanıcı ile başarılı olmalı', async () => {
        process.env.NODE_ENV = 'development';
        req.headers.authorization = 'Bearer valid-token';
        const mockUser = { id: 1, username: 'test' };
        jest.spyOn(jwt, 'verify').mockReturnValue({ id: 1 });
        pool.query.mockResolvedValue({ rows: [mockUser] });

        await auth(req, res, next);

        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    it('hata durumunda 401 hatası dönmeli', async () => {
        process.env.NODE_ENV = 'development';
        req.headers.authorization = 'Bearer valid-token';
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('Test error');
        });

        await auth(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe('Yetkilendirme hatası');
        expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
}); 