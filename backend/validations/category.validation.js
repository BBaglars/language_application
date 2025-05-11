const Joi = require('joi');

const createCategorySchema = Joi.object({
    name: Joi.string()
        .required()
        .min(2)
        .max(50)
        .messages({
            'string.empty': 'Kategori adı boş olamaz',
            'string.min': 'Kategori adı en az 2 karakter olmalıdır',
            'string.max': 'Kategori adı en fazla 50 karakter olmalıdır',
            'any.required': 'Kategori adı zorunludur'
        }),
    description: Joi.string()
        .max(200)
        .messages({
            'string.max': 'Açıklama en fazla 200 karakter olmalıdır'
        })
});

const updateCategorySchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .messages({
            'string.empty': 'Kategori adı boş olamaz',
            'string.min': 'Kategori adı en az 2 karakter olmalıdır',
            'string.max': 'Kategori adı en fazla 50 karakter olmalıdır'
        }),
    description: Joi.string()
        .max(200)
        .messages({
            'string.max': 'Açıklama en fazla 200 karakter olmalıdır'
        })
});

module.exports = {
    createCategorySchema,
    updateCategorySchema
}; 