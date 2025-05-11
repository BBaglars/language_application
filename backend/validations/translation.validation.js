const Joi = require('joi');

const createTranslationSchema = Joi.object({
    sourceText: Joi.string()
        .required()
        .min(1)
        .max(1000)
        .messages({
            'string.base': 'Kaynak metin bir metin olmalıdır',
            'string.empty': 'Kaynak metin boş olamaz',
            'string.min': 'Kaynak metin en az 1 karakter olmalıdır',
            'string.max': 'Kaynak metin en fazla 1000 karakter olmalıdır',
            'any.required': 'Kaynak metin zorunludur'
        }),
    targetText: Joi.string()
        .required()
        .min(1)
        .max(1000)
        .messages({
            'string.base': 'Hedef metin bir metin olmalıdır',
            'string.empty': 'Hedef metin boş olamaz',
            'string.min': 'Hedef metin en az 1 karakter olmalıdır',
            'string.max': 'Hedef metin en fazla 1000 karakter olmalıdır',
            'any.required': 'Hedef metin zorunludur'
        }),
    languagePairId: Joi.number()
        .required()
        .messages({
            'number.base': 'Dil çifti ID bir sayı olmalıdır',
            'any.required': 'Dil çifti ID zorunludur'
        })
});

const updateTranslationSchema = Joi.object({
    sourceText: Joi.string()
        .min(1)
        .max(1000)
        .messages({
            'string.base': 'Kaynak metin bir metin olmalıdır',
            'string.empty': 'Kaynak metin boş olamaz',
            'string.min': 'Kaynak metin en az 1 karakter olmalıdır',
            'string.max': 'Kaynak metin en fazla 1000 karakter olmalıdır'
        }),
    targetText: Joi.string()
        .min(1)
        .max(1000)
        .messages({
            'string.base': 'Hedef metin bir metin olmalıdır',
            'string.empty': 'Hedef metin boş olamaz',
            'string.min': 'Hedef metin en az 1 karakter olmalıdır',
            'string.max': 'Hedef metin en fazla 1000 karakter olmalıdır'
        })
});

module.exports = {
    createTranslationSchema,
    updateTranslationSchema
}; 