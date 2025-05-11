const {
  successResponse,
  errorResponse,
  paginatedResponse
} = require('../../../backend/utils/response');

describe('Response Utils Tests', () => {
  describe('successResponse', () => {
    it('başarılı yanıt formatı oluşturmalı', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'İşlem başarılı';

      const response = successResponse(data, message);

      expect(response).toEqual({
        success: true,
        message,
        data
      });
    });

    it('mesaj olmadan başarılı yanıt formatı oluşturmalı', () => {
      const data = { id: 1, name: 'Test' };

      const response = successResponse(data);

      expect(response).toEqual({
        success: true,
        message: 'İşlem başarıyla tamamlandı',
        data
      });
    });

    it('boş veri ile başarılı yanıt formatı oluşturmalı', () => {
      const response = successResponse();

      expect(response).toEqual({
        success: true,
        message: 'İşlem başarıyla tamamlandı',
        data: null
      });
    });
  });

  describe('errorResponse', () => {
    it('hata yanıt formatı oluşturmalı', () => {
      const message = 'Bir hata oluştu';
      const errors = ['Hata detayı 1', 'Hata detayı 2'];
      const statusCode = 400;

      const response = errorResponse(message, errors, statusCode);

      expect(response).toEqual({
        success: false,
        message,
        errors,
        statusCode
      });
    });

    it('hata detayları olmadan hata yanıt formatı oluşturmalı', () => {
      const message = 'Bir hata oluştu';
      const statusCode = 400;

      const response = errorResponse(message, null, statusCode);

      expect(response).toEqual({
        success: false,
        message,
        errors: null,
        statusCode
      });
    });

    it('varsayılan durum kodu ile hata yanıt formatı oluşturmalı', () => {
      const message = 'Bir hata oluştu';

      const response = errorResponse(message);

      expect(response).toEqual({
        success: false,
        message,
        errors: null,
        statusCode: 500
      });
    });
  });

  describe('paginatedResponse', () => {
    it('sayfalanmış yanıt formatı oluşturmalı', () => {
      const data = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' }
      ];
      const total = 100;
      const page = 1;
      const limit = 10;
      const message = 'Veriler başarıyla getirildi';

      const response = paginatedResponse(data, total, page, limit, message);

      expect(response).toEqual({
        success: true,
        message,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    });

    it('varsayılan sayfalama parametreleri ile yanıt formatı oluşturmalı', () => {
      const data = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' }
      ];
      const total = 100;

      const response = paginatedResponse(data, total);

      expect(response).toEqual({
        success: true,
        message: 'Veriler başarıyla getirildi',
        data,
        pagination: {
          total,
          page: 1,
          limit: 10,
          totalPages: 10
        }
      });
    });

    it('boş veri ile sayfalanmış yanıt formatı oluşturmalı', () => {
      const total = 0;
      const page = 1;
      const limit = 10;

      const response = paginatedResponse([], total, page, limit);

      expect(response).toEqual({
        success: true,
        message: 'Veriler başarıyla getirildi',
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      });
    });
  });
});