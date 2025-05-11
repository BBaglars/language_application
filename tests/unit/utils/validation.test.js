const {
  validateSchema,
  validateEmail,
  validatePassword,
  validateLanguageCode,
  validateDifficultyLevel
} = require('../../../backend/utils/validation');

describe('Validation Utils Tests', () => {
  describe('validateSchema', () => {
    const testSchema = {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        age: { type: 'number', minimum: 18 }
      }
    };

    it('geçerli veri için true dönmeli', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25
      };

      const result = validateSchema(validData, testSchema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });

    it('geçersiz veri için hata dönmeli', () => {
      const invalidData = {
        name: 'T', // Çok kısa
        email: 'invalid-email',
        age: 15 // Çok küçük
      };

      const result = validateSchema(invalidData, testSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('eksik zorunlu alanlar için hata dönmeli', () => {
      const missingData = {
        name: 'Test User'
        // email eksik
      };

      const result = validateSchema(missingData, testSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('geçerli email adresleri için true dönmeli', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('geçersiz email adresleri için false dönmeli', () => {
      const invalidEmails = [
        'invalid-email',
        'user@',
        '@domain.com',
        'user@.com',
        'user@domain.'
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('geçerli şifreler için true dönmeli', () => {
      const validPasswords = [
        'Password123!',
        'StrongP@ssw0rd',
        'Abc123!@#'
      ];

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it('geçersiz şifreler için false dönmeli', () => {
      const invalidPasswords = [
        'short', // Çok kısa
        'no-uppercase-123!', // Büyük harf yok
        'NO-LOWERCASE-123!', // Küçük harf yok
        'NoSpecialChar123', // Özel karakter yok
        'NoNumbers!!' // Rakam yok
      ];

      invalidPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });

  describe('validateLanguageCode', () => {
    it('geçerli dil kodları için true dönmeli', () => {
      const validCodes = ['en', 'tr', 'es', 'fr', 'de'];

      validCodes.forEach(code => {
        expect(validateLanguageCode(code)).toBe(true);
      });
    });

    it('geçersiz dil kodları için false dönmeli', () => {
      const invalidCodes = [
        'eng', // Çok uzun
        't', // Çok kısa
        '12', // Sayısal
        'a!', // Özel karakter
        'EN' // Büyük harf
      ];

      invalidCodes.forEach(code => {
        expect(validateLanguageCode(code)).toBe(false);
      });
    });
  });

  describe('validateDifficultyLevel', () => {
    it('should validate correct difficulty levels', () => {
      const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

      validLevels.forEach(level => {
        expect(validateDifficultyLevel(level)).toBe(true);
      });
    });

    it('should reject invalid difficulty levels', () => {
      const invalidLevels = [
        'BEGINNER',
        'INTERMEDIATE',
        'ADVANCED',
        'X1',
        'D1',
        'A3',
        'B3',
        'C3',
        '1A',
        '2B'
      ];

      invalidLevels.forEach(level => {
        expect(validateDifficultyLevel(level)).toBe(false);
      });
    });
  });
});