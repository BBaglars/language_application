const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateStory(prompt, parameters) {
    try {
      const fullPrompt = this.buildPrompt(prompt, parameters);
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Hikaye üretilirken bir hata oluştu');
    }
  }

  async generateTranslation(text, sourceLanguage, targetLanguage) {
    try {
      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n${text}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Çeviri yapılırken bir hata oluştu');
    }
  }

  async generateWordExamples(word, language, count = 3) {
    try {
      const prompt = `Generate ${count} example sentences using the word "${word}" in ${language}. Each sentence should be different and show different uses of the word.`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().split('\n').filter(Boolean);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Örnek cümleler üretilirken bir hata oluştu');
    }
  }

  buildPrompt(prompt, parameters) {
    let fullPrompt = `
      Sen bir dil öğretmenisin. Aşağıdaki kriterlere göre bir metin oluştur:

      Dil: ${parameters.language || 'Türkçe'}
      Seviye: ${parameters.difficulty_level || 'B1'}
      Tür: ${parameters.type || 'hikaye'}
      Uzunluk: ${parameters.length || 'orta'}
      Amaç: ${parameters.purpose || 'bilgilendirici'}
      Hedef Yaş Grubu: ${parameters.ageGroup || 'child'}

      ${prompt}

      ${parameters.keywords ? `Kullanılacak kelimeler:\n${parameters.keywords.join(', ')}` : ''}

      Lütfen metni bu kriterlere göre oluştur ve aşağıdaki formatta döndür:
      {
        "title": "Metin başlığı",
        "content": "Metin içeriği",
        "usedWords": ["kullanılan", "kelimeler"],
        "difficulty": "seviye"
      }
    `;

    return fullPrompt;
  }
}

module.exports = new GeminiService(); 