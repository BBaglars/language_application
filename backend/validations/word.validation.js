const Joi = require('joi');

const translationSchema = Joi.object({
    languageId: Joi.number()
        .required()
        .messages({
            'number.base': 'Dil ID bir sayı olmalıdır',
            'any.required': 'Dil ID zorunludur'
        }),
    text: Joi.string()
        .required()
        .min(1)
        .max(100)
        .messages({
            'string.base': 'Çeviri bir metin olmalıdır',
            'string.empty': 'Çeviri boş olamaz',
            'string.min': 'Çeviri en az 1 karakter olmalıdır',
            'string.max': 'Çeviri en fazla 100 karakter olmalıdır',
            'any.required': 'Çeviri zorunludur'
        })
});

const createWordSchema = Joi.object({
    text: Joi.string()
        .required()
        .min(1)
        .max(100)
        .messages({
            'string.base': 'Kelime bir metin olmalıdır',
            'string.empty': 'Kelime boş olamaz',
            'string.min': 'Kelime en az 1 karakter olmalıdır',
            'string.max': 'Kelime en fazla 100 karakter olmalıdır',
            'any.required': 'Kelime zorunludur'
        }),
    languageId: Joi.number()
        .required()
        .messages({
            'number.base': 'Dil ID bir sayı olmalıdır',
            'any.required': 'Dil ID zorunludur'
        }),
    translations: Joi.array()
        .items(translationSchema)
        .messages({
            'array.base': 'Çeviriler bir dizi olmalıdır'
        })
});

const updateWordSchema = Joi.object({
    text: Joi.string()
        .min(1)
        .max(100)
        .messages({
            'string.base': 'Kelime bir metin olmalıdır',
            'string.min': 'Kelime en az 1 karakter olmalıdır',
            'string.max': 'Kelime en fazla 100 karakter olmalıdır'
        }),
    languageId: Joi.number()
        .messages({
            'number.base': 'Dil ID bir sayı olmalıdır'
        }),
    translations: Joi.array()
        .items(translationSchema)
        .messages({
            'array.base': 'Çeviriler bir dizi olmalıdır'
        })
});

module.exports = {
    createWordSchema,
    updateWordSchema
}; 