const Joi = require('joi');

const createCriteriaSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.base': 'İsim bir metin olmalıdır',
            'string.min': 'İsim en az 3 karakter olmalıdır',
            'string.max': 'İsim en fazla 100 karakter olmalıdır',
            'any.required': 'İsim zorunludur'
        }),
    description: Joi.string()
        .allow('')
        .max(500)
        .messages({
            'string.base': 'Açıklama bir metin olmalıdır',
            'string.max': 'Açıklama en fazla 500 karakter olmalıdır'
        }),
    parameters: Joi.object()
        .default({})
        .messages({
            'object.base': 'Parametreler bir obje olmalıdır'
        })
});

const updateCriteriaSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.base': 'İsim bir metin olmalıdır',
            'string.min': 'İsim en az 3 karakter olmalıdır',
            'string.max': 'İsim en fazla 100 karakter olmalıdır'
        }),
    description: Joi.string()
        .allow('')
        .max(500)
        .messages({
            'string.base': 'Açıklama bir metin olmalıdır',
            'string.max': 'Açıklama en fazla 500 karakter olmalıdır'
        }),
    parameters: Joi.object()
        .messages({
            'object.base': 'Parametreler bir obje olmalıdır'
        })
});

module.exports = {
    createCriteriaSchema,
    updateCriteriaSchema
}; 