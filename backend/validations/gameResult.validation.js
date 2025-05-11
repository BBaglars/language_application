const Joi = require('joi');

const createGameResultSchema = Joi.object({
  languageId: Joi.number().required(),
  gameType: Joi.string().required(),
  score: Joi.number().required(),
  duration: Joi.number().required()
});

const updateGameResultSchema = Joi.object({
  score: Joi.number(),
  duration: Joi.number()
});

module.exports = {
  createGameResultSchema,
  updateGameResultSchema
}; 