const Joi = require('joi');

const createLanguageSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(2)
        .max(50)
        .messages({
            'string.base': 'Dil adı bir metin olmalıdır',
            'string.empty': 'Dil adı boş olamaz',
            'string.min': 'Dil adı en az 2 karakter olmalıdır',
            'string.max': 'Dil adı en fazla 50 karakter olmalıdır',
            'any.required': 'Dil adı zorunludur'
        }),
    code: Joi.string()
        .required()
        .length(2)
        .messages({
            'string.base': 'Dil kodu bir metin olmalıdır',
            'string.empty': 'Dil kodu boş olamaz',
            'string.length': 'Dil kodu 2 karakter olmalıdır',
            'any.required': 'Dil kodu zorunludur'
        })
});

const updateLanguageSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .messages({
            'string.base': 'Dil adı bir metin olmalıdır',
            'string.min': 'Dil adı en az 2 karakter olmalıdır',
            'string.max': 'Dil adı en fazla 50 karakter olmalıdır'
        }),
    code: Joi.string()
        .length(2)
        .messages({
            'string.base': 'Dil kodu bir metin olmalıdır',
            'string.length': 'Dil kodu 2 karakter olmalıdır'
        })
});

module.exports = {
    createLanguageSchema,
    updateLanguageSchema
}; 