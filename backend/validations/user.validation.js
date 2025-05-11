const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(2)
        .max(50)
        .messages({
            'string.base': 'İsim bir metin olmalıdır',
            'string.empty': 'İsim boş olamaz',
            'string.min': 'İsim en az 2 karakter olmalıdır',
            'string.max': 'İsim en fazla 50 karakter olmalıdır',
            'any.required': 'İsim zorunludur'
        }),
    email: Joi.string()
        .required()
        .email()
        .messages({
            'string.base': 'Email bir metin olmalıdır',
            'string.empty': 'Email boş olamaz',
            'string.email': 'Geçerli bir email adresi giriniz',
            'any.required': 'Email zorunludur'
        }),
    password: Joi.string()
        .required()
        .min(6)
        .messages({
            'string.base': 'Şifre bir metin olmalıdır',
            'string.empty': 'Şifre boş olamaz',
            'string.min': 'Şifre en az 6 karakter olmalıdır',
            'any.required': 'Şifre zorunludur'
        })
});

const loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .messages({
            'string.base': 'Email bir metin olmalıdır',
            'string.empty': 'Email boş olamaz',
            'string.email': 'Geçerli bir email adresi giriniz',
            'any.required': 'Email zorunludur'
        }),
    password: Joi.string()
        .required()
        .messages({
            'string.base': 'Şifre bir metin olmalıdır',
            'string.empty': 'Şifre boş olamaz',
            'any.required': 'Şifre zorunludur'
        })
});

const updateProfileSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .messages({
            'string.base': 'İsim bir metin olmalıdır',
            'string.min': 'İsim en az 2 karakter olmalıdır',
            'string.max': 'İsim en fazla 50 karakter olmalıdır'
        }),
    email: Joi.string()
        .email()
        .messages({
            'string.base': 'Email bir metin olmalıdır',
            'string.email': 'Geçerli bir email adresi giriniz'
        }),
    currentPassword: Joi.string()
        .messages({
            'string.base': 'Mevcut şifre bir metin olmalıdır'
        }),
    newPassword: Joi.string()
        .min(6)
        .messages({
            'string.base': 'Yeni şifre bir metin olmalıdır',
            'string.min': 'Yeni şifre en az 6 karakter olmalıdır'
        })
}).custom((obj, helpers) => {
    // Eğer yeni şifre varsa, mevcut şifre de olmalı
    if (obj.newPassword && !obj.currentPassword) {
        return helpers.error('any.custom', {
            message: 'Yeni şifre için mevcut şifre gereklidir'
        });
    }
    return obj;
});

const deleteProfileSchema = Joi.object({
    password: Joi.string()
        .required()
        .messages({
            'string.base': 'Şifre bir metin olmalıdır',
            'any.required': 'Şifre zorunludur'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    deleteProfileSchema
}; 