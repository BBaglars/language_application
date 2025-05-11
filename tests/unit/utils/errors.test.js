const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError
} = require('../../../backend/utils/errors');

describe('Error Classes Tests', () => {
  describe('AppError', () => {
    it('doğru özelliklerle oluşturulmalı', () => {
      const error = new AppError('Test error', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });

    it('5xx hata kodları için status error olmalı', () => {
      const error = new AppError('Server error', 500);

      expect(error.status).toBe('error');
    });
  });

  describe('ValidationError', () => {
    it('doğru özelliklerle oluşturulmalı', () => {
      const error = new ValidationError('Validation error');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Validation error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('AuthenticationError', () => {
    it('doğru özelliklerle oluşturulmalı', () => {
      const error = new AuthenticationError('Auth error');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Auth error');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('AuthorizationError', () => {
    it('doğru özelliklerle oluşturulmalı', () => {
      const error = new AuthorizationError('Authz error');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Authz error');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });
  });

  describe('NotFoundError', () => {
    it('doğru özelliklerle oluşturulmalı', () => {
      const error = new NotFoundError('Not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('ConflictError', () => {
    it('doğru özelliklerle oluşturulmalı', () => {
      const error = new ConflictError('Conflict');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Conflict');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });

  describe('DatabaseError', () => {
    it('doğru özelliklerle oluşturulmalı', () => {
      const error = new DatabaseError('DB error');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('DB error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });
  });
}); 