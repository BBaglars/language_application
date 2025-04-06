const { sanitizeInput, validateRequest } = require('../../middleware/validator');
const { validateSchema } = require('../../utils/validator');

jest.mock('../../utils/validator');

describe('Input Validation Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                name: '<script>alert("xss")</script>',
                email: 'test@example.com'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('sanitizeInput', () => {
        test('should sanitize input data', () => {
            sanitizeInput(req, res, next);

            expect(req.body.name).not.toContain('<script>');
            expect(req.body.email).toBe('test@example.com');
            expect(next).toHaveBeenCalled();
        });

        test('should handle non-string values', () => {
            req.body = {
                number: 123,
                boolean: true,
                array: [1, 2, 3]
            };

            sanitizeInput(req, res, next);

            expect(req.body.number).toBe(123);
            expect(req.body.boolean).toBe(true);
            expect(req.body.array).toEqual([1, 2, 3]);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('validateRequest', () => {
        const schema = {
            name: 'string',
            email: 'email'
        };

        test('should pass validation for valid data', () => {
            validateSchema.mockReturnValue({ error: null });
            const middleware = validateRequest(schema);

            middleware(req, res, next);

            expect(validateSchema).toHaveBeenCalledWith(schema, req.body);
            expect(next).toHaveBeenCalled();
        });

        test('should return error for invalid data', () => {
            const validationError = {
                details: [{ message: 'Invalid email' }]
            };
            validateSchema.mockReturnValue({ error: validationError });
            const middleware = validateRequest(schema);

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation Error',
                details: validationError.details
            });
            expect(next).not.toHaveBeenCalled();
        });
    });
}); 