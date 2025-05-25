const { ValidationError, AppError } = require('../utils/errors.js');
const Joi = require('joi');

// CEFR seviyeleri için validasyon
const validateCEFRLevel = (level) => {
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (!validLevels.includes(level)) {
    throw new AppError('Geçersiz CEFR seviyesi. A1, A2, B1, B2, C1 veya C2 olmalıdır', 400);
  }
  return true;
};

// Kelime validasyonu
const validateWord = (data) => {
  const schema = Joi.object({
    text: Joi.string().required().messages({
      'string.empty': 'Kelime metni boş olamaz',
      'any.required': 'Kelime metni zorunludur'
    }),
    meaning: Joi.string().required().messages({
      'string.empty': 'Anlam boş olamaz',
      'any.required': 'Anlam zorunludur'
    }),
    example: Joi.string().allow('', null),
    difficultyLevel: Joi.string().valid('A1', 'A2', 'B1', 'B2', 'C1', 'C2').required().messages({
      'any.only': 'Geçersiz zorluk seviyesi',
      'any.required': 'Zorluk seviyesi zorunludur'
    }),
    languageId: Joi.number().required().messages({
      'number.base': 'Dil ID\'si sayı olmalıdır',
      'any.required': 'Dil ID\'si zorunludur'
    }),
    categories: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow('', null)
      })
    ).allow(null),
    letterCount: Joi.number().optional(),
  });

  return schema.validate(data);
};

// Kelime güncelleme validasyonu (opsiyonel alanlar)
const validateWordUpdate = (data) => {
  const schema = Joi.object({
    text: Joi.string().messages({
      'string.empty': 'Kelime metni boş olamaz'
    }),
    meaning: Joi.string().messages({
      'string.empty': 'Anlam boş olamaz'
    }),
    example: Joi.string().allow('', null),
    difficultyLevel: Joi.string().valid('A1', 'A2', 'B1', 'B2', 'C1', 'C2').messages({
      'any.only': 'Geçersiz zorluk seviyesi'
    }),
    languageId: Joi.number().messages({
      'number.base': 'Dil ID\'si sayı olmalıdır'
    }),
    categories: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        description: Joi.string().allow('', null)
      })
    ).allow(null),
    letterCount: Joi.number().optional(),
  });
  return schema.validate(data);
};

// Çeviri validasyonu
const validateTranslation = (data) => {
  const schema = Joi.object({
    sourceWordId: Joi.number().required().messages({
      'number.base': 'Kaynak kelime ID sayı olmalı',
      'any.required': 'Kaynak kelime zorunlu'
    }),
    targetWordId: Joi.number().optional(),
    targetText: Joi.string().allow(null, '').optional(),
    languagePairId: Joi.number().required().messages({
      'number.base': 'Dil çifti ID sayı olmalı',
      'any.required': 'Dil çifti zorunlu'
    }),
    difficultyLevel: Joi.string().valid('A1','A2','B1','B2','C1','C2').required().messages({
      'any.only': 'Seviye A1, A2, B1, B2, C1 veya C2 olmalı',
      'any.required': 'Seviye zorunlu'
    })
  }).or('targetWordId', 'targetText').messages({
    'object.missing': 'Hedef kelime veya anlam (text) zorunlu'
  });
  return schema.validate(data);
};

// Hikaye validasyonu
const validateStory = (req, res, next) => {
  try {
    const { title, content, difficultyLevel, languageId } = req.body;

    if (!title || !content || !difficultyLevel || !languageId) {
      throw new AppError('Tüm alanlar zorunludur', 400);
    }

    if (title.length > 255) {
      throw new AppError('Başlık çok uzun', 400);
    }

    validateCEFRLevel(difficultyLevel);

    next();
  } catch (error) {
    next(error);
  }
};

const validateLanguage = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Dil adı boş olamaz',
      'any.required': 'Dil adı zorunludur'
    }),
    code: Joi.string().required().messages({
      'string.empty': 'Dil kodu boş olamaz',
      'any.required': 'Dil kodu zorunludur'
    })
  });

  return schema.validate(data);
};

const validateCategory = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Kategori adı boş olamaz',
      'any.required': 'Kategori adı zorunludur'
    }),
    description: Joi.string().allow('', null)
  });

  return schema.validate(data);
};

module.exports = {
  validateCEFRLevel,
  validateWord,
  validateTranslation,
  validateStory,
  validateLanguage,
  validateCategory,
  validateWordUpdate,
};