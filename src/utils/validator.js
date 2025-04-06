const Joi = require('joi');

// Kullanıcı şemaları
const userSchemas = {
    create: Joi.object({
        firebase_uid: Joi.string().required(),
        email: Joi.string().email().required(),
        username: Joi.string().min(3).max(50).required(),
        full_name: Joi.string().max(100),
        avatar_url: Joi.string().uri()
    }),

    update: Joi.object({
        username: Joi.string().min(3).max(50),
        full_name: Joi.string().max(100),
        avatar_url: Joi.string().uri()
    })
};

// Kelime şemaları
const wordSchemas = {
    create: Joi.object({
        word: Joi.string().required(),
        language_id: Joi.number().integer().required(),
        difficulty_level: Joi.string().valid('A1', 'A2', 'B1', 'B2', 'C1', 'C2').required(),
        created_by: Joi.number().integer().required()
    }),

    update: Joi.object({
        word: Joi.string(),
        language_id: Joi.number().integer(),
        difficulty_level: Joi.string().valid('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
    })
};

// Kategori şemaları
const categorySchemas = {
    create: Joi.object({
        name: Joi.string().required(),
        description: Joi.string(),
        parent_id: Joi.number().integer(),
        created_by: Joi.number().integer().required()
    }),

    update: Joi.object({
        name: Joi.string(),
        description: Joi.string(),
        parent_id: Joi.number().integer()
    })
};

// Oyun şemaları
const gameSchemas = {
    createSession: Joi.object({
        user_id: Joi.number().integer().required(),
        game_type_id: Joi.number().integer().required(),
        language_id: Joi.number().integer().required(),
        category_id: Joi.number().integer()
    }),

    saveAnswer: Joi.object({
        session_id: Joi.number().integer().required(),
        word_id: Joi.number().integer().required(),
        user_answer: Joi.string().required(),
        is_correct: Joi.boolean().required()
    })
};

// AI şemaları
const aiSchemas = {
    generateText: Joi.object({
        prompt: Joi.string().required(),
        language: Joi.string().required(),
        level: Joi.string().valid('A1', 'A2', 'B1', 'B2', 'C1', 'C2').required()
    }),

    checkGrammar: Joi.object({
        text: Joi.string().required(),
        language: Joi.string().required()
    }),

    analyzeText: Joi.object({
        text: Joi.string().required(),
        language: Joi.string().required()
    }),

    suggestWords: Joi.object({
        context: Joi.string().required(),
        language: Joi.string().required(),
        count: Joi.number().integer().min(1).max(10)
    }),

    summarizeText: Joi.object({
        text: Joi.string().required(),
        language: Joi.string().required(),
        maxLength: Joi.number().integer().min(10).max(500)
    }),

    translateText: Joi.object({
        text: Joi.string().required(),
        sourceLanguage: Joi.string().required(),
        targetLanguage: Joi.string().required()
    })
};

// Admin şemaları
const adminSchemas = {
    create: Joi.object({
        user_id: Joi.number().integer().required(),
        role: Joi.string().valid('admin', 'super_admin').required(),
        permissions: Joi.object()
    }),

    update: Joi.object({
        role: Joi.string().valid('admin', 'super_admin'),
        permissions: Joi.object()
    })
};

// Şema doğrulama fonksiyonu
const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }
        next();
    };
};

module.exports = {
    userSchemas,
    wordSchemas,
    categorySchemas,
    gameSchemas,
    aiSchemas,
    adminSchemas,
    validateSchema
}; 