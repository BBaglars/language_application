const { ValidationError } = require('../utils/errors');
const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});

      throw new ValidationError('Validation Error', errors);
    }

    next();
  };
};

// Validation şemaları
const schemas = {
  word: Joi.object({
    text: Joi.string().required().min(1).max(100),
    language_code: Joi.string().required().length(2),
    difficulty_level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').required()
  }),

  category: Joi.object({
    name: Joi.string().required().min(1).max(50),
    description: Joi.string().max(500).allow('')
  }),

  story: Joi.object({
    title: Joi.string().required().min(1).max(100),
    content: Joi.string().required().min(10),
    difficulty_level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').required()
  }),

  gameResult: Joi.object({
    game_type: Joi.string().valid('WORD_MATCH', 'TRANSLATION', 'STORY_COMPLETION').required(),
    score: Joi.number().integer().min(0).required(),
    duration: Joi.number().integer().min(0).required()
  }),

  user: Joi.object({
    email: Joi.string().email().required(),
    firebase_uid: Joi.string().required()
  })
};

module.exports = {
  validate,
  schemas
}; 