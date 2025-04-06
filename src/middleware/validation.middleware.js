const { ValidationError } = require('./error.middleware');

// Şema doğrulama
const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            throw new ValidationError(errors.join('. '));
        }

        next();
    };
};

// Kelime doğrulama şeması
const wordSchema = {
    base_word: Joi.string().required().min(1).max(100),
    letter_count: Joi.number().required().min(1).max(50),
    language_level_id: Joi.number().required(),
    translations: Joi.array().items(
        Joi.object({
            language_id: Joi.number().required(),
            translation: Joi.string().required(),
            example_sentence: Joi.string().optional()
        })
    ).min(1),
    categories: Joi.array().items(Joi.number()).optional()
};

// Kategori doğrulama şeması
const categorySchema = {
    name: Joi.string().required().min(1).max(100),
    description: Joi.string().optional().max(500),
    icon_url: Joi.string().uri().optional()
};

// Kullanıcı doğrulama şeması
const userSchema = {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required().min(1).max(100),
    profile_picture_url: Joi.string().uri().optional()
};

// Oyun oturumu doğrulama şeması
const gameSessionSchema = {
    game_type_id: Joi.number().required(),
    word_count: Joi.number().min(1).max(100).optional()
};

// AI metin oluşturma doğrulama şeması
const generateTextSchema = {
    category_id: Joi.number().required(),
    word_count: Joi.number().min(50).max(1000).optional()
};

// Admin doğrulama şeması
const adminSchema = {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required().min(1).max(100),
    role: Joi.string().valid('admin', 'super_admin').optional()
};

// Query parametreleri doğrulama
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, {
            abortEarly: false,
            allowUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            throw new ValidationError(errors.join('. '));
        }

        next();
    };
};

// Sayfalama query şeması
const paginationSchema = {
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
};

// Filtreleme query şeması
const filterSchema = {
    letter_count: Joi.number().min(1).max(50).optional(),
    language_level_id: Joi.number().optional(),
    category_id: Joi.number().optional(),
    mastery_level: Joi.number().min(0).max(5).optional()
};

module.exports = {
    validateSchema,
    validateQuery,
    wordSchema,
    categorySchema,
    userSchema,
    gameSessionSchema,
    generateTextSchema,
    adminSchema,
    paginationSchema,
    filterSchema
}; 