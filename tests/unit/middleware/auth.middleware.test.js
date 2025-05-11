const { authenticate, authorizeRole } = require('../../../backend/middleware/auth.middleware');
const { AuthenticationError, AuthorizationError } = require('../../../backend/utils/errors');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware Tests', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {
        authorization: 'Bearer test-token'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      jwt.verify.mockReturnValue(mockUser);

      authenticate(mockRequest, mockResponse, nextFunction);

      expect(jwt.verify).toHaveBeenCalledWith('test-token', process.env.JWT_SECRET);
      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should throw AuthenticationError for missing token', () => {
      mockRequest.headers.authorization = undefined;

      authenticate(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthenticationError));
    });

    it('should throw AuthenticationError for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthenticationError));
    });
  });

  describe('authorizeRole', () => {
    it('should authorize user with correct role', () => {
      mockRequest.user = { role: 'ADMIN' };

      authorizeRole(['ADMIN'])(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should throw AuthorizationError for incorrect role', () => {
      mockRequest.user = { role: 'USER' };

      authorizeRole(['ADMIN'])(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
    });

    it('should throw AuthorizationError for missing user', () => {
      mockRequest.user = undefined;

      authorizeRole(['ADMIN'])(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
    });
  });
});