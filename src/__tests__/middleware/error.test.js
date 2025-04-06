const { AppError, errorHandler } = require('../../middleware/error');

describe('Error Handling Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('AppError', () => {
        test('should create error with status code', () => {
            const error = new AppError('Test error', 400);
            
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.status).toBe('fail');
            expect(error.isOperational).toBe(true);
        });

        test('should set status to error for 5xx codes', () => {
            const error = new AppError('Server error', 500);
            
            expect(error.status).toBe('error');
        });
    });

    describe('errorHandler', () => {
        test('should handle operational errors in development', () => {
            process.env.NODE_ENV = 'development';
            const error = new AppError('Test error', 400);

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'fail',
                error: error,
                message: 'Test error',
                stack: error.stack
            });
        });

        test('should handle operational errors in production', () => {
            process.env.NODE_ENV = 'production';
            const error = new AppError('Test error', 400);

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'fail',
                message: 'Test error'
            });
        });

        test('should handle non-operational errors', () => {
            process.env.NODE_ENV = 'development';
            const error = new Error('Test error');

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                error: error,
                message: 'Test error',
                stack: error.stack
            });
        });
    });
}); 