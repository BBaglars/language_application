const { Configuration, OpenAIApi } = require('openai');
const config = require('../config/index.js');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export default class OpenAIService {
  async generateStory(prompt, parameters) {
    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: this.buildPrompt(prompt, parameters),
        max_tokens: parameters.max_tokens || 1000,
        temperature: parameters.temperature || 0.7,
        top_p: parameters.top_p || 1,
        frequency_penalty: parameters.frequency_penalty || 0,
        presence_penalty: parameters.presence_penalty || 0
      });

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Hikaye üretilirken bir hata oluştu');
    }
  }

  async generateTranslation(text, sourceLanguage, targetLanguage) {
    try {
      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n${text}`;

      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 1000,
        temperature: 0.3,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Çeviri yapılırken bir hata oluştu');
    }
  }

  async generateWordExamples(word, language, count = 3) {
    try {
      const prompt = `Generate ${count} example sentences using the word "${word}" in ${language}. Each sentence should be different and show different uses of the word.`;

      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      return response.data.choices[0].text.trim().split('\n').filter(Boolean);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Örnek cümleler üretilirken bir hata oluştu');
    }
  }

  buildPrompt(prompt, parameters) {
    let fullPrompt = prompt;

    if (parameters.tone) {
      fullPrompt += `\nTone: ${parameters.tone}`;
    }

    if (parameters.style) {
      fullPrompt += `\nStyle: ${parameters.style}`;
    }

    if (parameters.length) {
      fullPrompt += `\nLength: ${parameters.length}`;
    }

    if (parameters.keywords) {
      fullPrompt += `\nKeywords to include: ${parameters.keywords.join(', ')}`;
    }

    if (parameters.difficulty_level) {
      fullPrompt += `\nDifficulty Level: ${parameters.difficulty_level}`;
    }

    return fullPrompt;
  }
} 