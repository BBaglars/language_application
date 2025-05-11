const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Geçerli bir email adresi giriniz',
            'any.required': 'Email adresi gerekli'
        }),
    firebaseId: Joi.string()
        .required()
        .messages({
            'any.required': 'Firebase ID gerekli'
        }),
    name: Joi.string()
        .min(2)
        .messages({
            'string.min': 'İsim en az 2 karakter olmalıdır'
        })
});

const loginSchema = Joi.object({
    firebaseId: Joi.string()
        .required()
        .messages({
            'any.required': 'Firebase ID gerekli'
        })
});

module.exports = {
    registerSchema,
    loginSchema
}; 