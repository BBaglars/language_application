const Joi = require('joi');

const createStorySchema = Joi.object({
    languageId: Joi.number()
        .required()
        .messages({
            'number.base': 'Dil ID bir sayı olmalıdır',
            'any.required': 'Dil ID zorunludur'
        }),
    title: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.base': 'Başlık bir metin olmalıdır',
            'string.min': 'Başlık en az 3 karakter olmalıdır',
            'string.max': 'Başlık en fazla 100 karakter olmalıdır',
            'any.required': 'Başlık zorunludur'
        }),
    content: Joi.string()
        .required()
        .min(10)
        .max(5000)
        .messages({
            'string.base': 'İçerik bir metin olmalıdır',
            'string.min': 'İçerik en az 10 karakter olmalıdır',
            'string.max': 'İçerik en fazla 5000 karakter olmalıdır',
            'any.required': 'İçerik zorunludur'
        }),
    difficultyLevel: Joi.string()
        .required()
        .valid('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
        .messages({
            'string.base': 'Zorluk seviyesi bir metin olmalıdır',
            'any.only': 'Zorluk seviyesi A1, A2, B1, B2, C1 veya C2 olmalıdır',
            'any.required': 'Zorluk seviyesi zorunludur'
        })
});

const updateStorySchema = Joi.object({
    languageId: Joi.number()
        .messages({
            'number.base': 'Dil ID bir sayı olmalıdır'
        }),
    title: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.base': 'Başlık bir metin olmalıdır',
            'string.min': 'Başlık en az 3 karakter olmalıdır',
            'string.max': 'Başlık en fazla 100 karakter olmalıdır'
        }),
    content: Joi.string()
        .min(10)
        .max(5000)
        .messages({
            'string.base': 'İçerik bir metin olmalıdır',
            'string.min': 'İçerik en az 10 karakter olmalıdır',
            'string.max': 'İçerik en fazla 5000 karakter olmalıdır'
        }),
    difficultyLevel: Joi.string()
        .valid('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
        .messages({
            'string.base': 'Zorluk seviyesi bir metin olmalıdır',
            'any.only': 'Zorluk seviyesi A1, A2, B1, B2, C1 veya C2 olmalıdır'
        })
});

module.exports = {
    createStorySchema,
    updateStorySchema
}; 