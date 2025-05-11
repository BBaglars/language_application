const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../../../backend/utils/jwt.js');

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn()
}));

describe('JWT Utils Tests', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            const mockToken = 'mock.jwt.token';
            jwt.sign.mockReturnValue(mockToken);

            const userId = 1;
            const token = generateToken(userId);

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: userId },
                'test-secret',
                { expiresIn: '30d' }
            );
            expect(token).toBe(mockToken);
        });

        it('should use default secret if JWT_SECRET is not set', () => {
            delete process.env.JWT_SECRET;
            const mockToken = 'mock.jwt.token';
            jwt.sign.mockReturnValue(mockToken);

            const userId = 1;
            const token = generateToken(userId);

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: userId },
                'test-secret',
                { expiresIn: '30d' }
            );
            expect(token).toBe(mockToken);
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid token', () => {
            const mockPayload = { id: 1 };
            jwt.verify.mockReturnValue(mockPayload);

            const token = 'valid.jwt.token';
            const result = verifyToken(token);

            expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
            expect(result).toEqual(mockPayload);
        });

        it('should return null for invalid token', () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const token = 'invalid.jwt.token';
            const result = verifyToken(token);

            expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
            expect(result).toBeNull();
        });

        it('should use default secret if JWT_SECRET is not set', () => {
            delete process.env.JWT_SECRET;
            const mockPayload = { id: 1 };
            jwt.verify.mockReturnValue(mockPayload);

            const token = 'valid.jwt.token';
            const result = verifyToken(token);

            expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
            expect(result).toEqual(mockPayload);
        });
    });
}); 