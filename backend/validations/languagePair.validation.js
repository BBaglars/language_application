const Joi = require('joi');

const createLanguagePairSchema = Joi.object({
    sourceLanguageId: Joi.number()
        .required()
        .messages({
            'number.base': 'Kaynak dil ID bir sayı olmalıdır',
            'any.required': 'Kaynak dil ID zorunludur'
        }),
    targetLanguageId: Joi.number()
        .required()
        .messages({
            'number.base': 'Hedef dil ID bir sayı olmalıdır',
            'any.required': 'Hedef dil ID zorunludur'
        })
}).custom((obj, helpers) => {
    if (obj.sourceLanguageId === obj.targetLanguageId) {
        return helpers.error('any.invalid', { message: 'Kaynak ve hedef dil aynı olamaz' });
    }
    return obj;
});

const updateLanguagePairSchema = Joi.object({
    sourceLanguageId: Joi.number()
        .messages({
            'number.base': 'Kaynak dil ID bir sayı olmalıdır'
        }),
    targetLanguageId: Joi.number()
        .messages({
            'number.base': 'Hedef dil ID bir sayı olmalıdır'
        })
}).custom((obj, helpers) => {
    if (obj.sourceLanguageId && obj.targetLanguageId && obj.sourceLanguageId === obj.targetLanguageId) {
        return helpers.error('any.invalid', { message: 'Kaynak ve hedef dil aynı olamaz' });
    }
    return obj;
});

module.exports = {
    createLanguagePairSchema,
    updateLanguagePairSchema
}; 