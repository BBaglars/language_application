const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../../../src/backend/utils/jwt');

jest.mock('jsonwebtoken');

describe('JWT Utils Tests', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('doğru parametrelerle token oluşturmalı', () => {
      const userId = 1;
      const expectedToken = 'mock-token';
      jwt.sign.mockReturnValue(expectedToken);

      const token = generateToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      expect(token).toBe(expectedToken);
    });
  });

  describe('verifyToken', () => {
    it('geçerli token için doğru sonuç dönmeli', () => {
      const token = 'valid-token';
      const expectedPayload = { id: 1 };
      jwt.verify.mockReturnValue(expectedPayload);

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(result).toEqual(expectedPayload);
    });

    it('geçersiz token için null dönmeli', () => {
      const token = 'invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(result).toBeNull();
    });
  });
}); 