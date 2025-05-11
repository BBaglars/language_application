const { logger } = require('../../../backend/utils/logger');

describe('Logger Utils Tests', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('info', () => {
    it('info seviyesinde log mesajı oluşturmalı', () => {
      const message = 'Test info message';
      const metadata = { userId: 123, action: 'login' };

      logger.info(message, metadata);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('INFO');
      expect(logCall).toContain(message);
      expect(logCall).toContain(JSON.stringify(metadata));
    });

    it('metadata olmadan info log mesajı oluşturmalı', () => {
      const message = 'Test info message without metadata';

      logger.info(message);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('INFO');
      expect(logCall).toContain(message);
    });
  });

  describe('error', () => {
    it('error seviyesinde log mesajı oluşturmalı', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      const metadata = { userId: 123, action: 'login' };

      logger.error(message, error, metadata);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('ERROR');
      expect(logCall).toContain(message);
      expect(logCall).toContain(error.stack);
      expect(logCall).toContain(JSON.stringify(metadata));
    });

    it('metadata olmadan error log mesajı oluşturmalı', () => {
      const message = 'Test error message without metadata';
      const error = new Error('Test error');

      logger.error(message, error);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('ERROR');
      expect(logCall).toContain(message);
      expect(logCall).toContain(error.stack);
    });
  });

  describe('warn', () => {
    it('warn seviyesinde log mesajı oluşturmalı', () => {
      const message = 'Test warning message';
      const metadata = { userId: 123, action: 'login' };

      logger.warn(message, metadata);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('WARN');
      expect(logCall).toContain(message);
      expect(logCall).toContain(JSON.stringify(metadata));
    });
  });

  describe('debug', () => {
    it('debug seviyesinde log mesajı oluşturmalı', () => {
      const message = 'Test debug message';
      const metadata = { userId: 123, action: 'login' };

      logger.debug(message, metadata);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('DEBUG');
      expect(logCall).toContain(message);
      expect(logCall).toContain(JSON.stringify(metadata));
    });
  });

  describe('log formatı', () => {
    it('log mesajı doğru formatta olmalı', () => {
      const message = 'Test message';
      const timestamp = new Date().toISOString();

      logger.info(message);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\]/); // timestamp
      expect(logCall).toMatch(/\[INFO\]/); // log level
      expect(logCall).toContain(message); // message
    });
  });
});