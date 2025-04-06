const OpenAI = require('openai');
const logger = require('../utils/logger');
const { query } = require('../config/database');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class AIService {
    static async generateText(prompt, language, level) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Sen ${language} dilinde ${level} seviyesinde metinler üreten bir asistansın. 
                        Metinler gramer açısından doğru ve anlaşılır olmalı.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const generatedText = completion.choices[0].message.content;
            
            // Oluşturulan metni veritabanına kaydet
            await query(
                'INSERT INTO ai_texts (user_id, language_id, text, type, metadata) VALUES (?, ?, ?, ?, ?)',
                [null, language, generatedText, 'generated', JSON.stringify({ prompt, level })]
            );

            return generatedText;
        } catch (error) {
            logger.error('Metin üretme hatası:', error);
            throw new Error('Metin üretilemedi');
        }
    }

    static async checkGrammar(text, language) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Sen ${language} dilinde gramer kontrolü yapan bir asistansın. 
                        Metindeki hataları bul ve düzelt.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            });

            const result = completion.choices[0].message.content;
            return result;
        } catch (error) {
            logger.error('Gramer kontrolü hatası:', error);
            throw new Error('Gramer kontrolü yapılamadı');
        }
    }

    static async analyzeText(text, language) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Sen ${language} dilinde metin analizi yapan bir asistansın. 
                        Metnin zorluk seviyesini, kullanılan kelimeleri ve gramer yapılarını analiz et.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            });

            const analysis = completion.choices[0].message.content;
            return analysis;
        } catch (error) {
            logger.error('Metin analizi hatası:', error);
            throw new Error('Metin analizi yapılamadı');
        }
    }

    static async suggestWords(context, language, count = 5) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Sen ${language} dilinde kelime önerileri yapan bir asistansın. 
                        Verilen bağlama uygun ${count} kelime öner.`
                    },
                    {
                        role: "user",
                        content: context
                    }
                ],
                temperature: 0.7,
                max_tokens: 100
            });

            const suggestions = completion.choices[0].message.content.split('\n');
            return suggestions;
        } catch (error) {
            logger.error('Kelime önerisi hatası:', error);
            throw new Error('Kelime önerileri alınamadı');
        }
    }

    static async summarizeText(text, language, maxLength = 100) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Sen ${language} dilinde metin özeti yapan bir asistansın. 
                        Metni en fazla ${maxLength} kelimeye indirgeyerek özetle.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 200
            });

            const summary = completion.choices[0].message.content;
            return summary;
        } catch (error) {
            logger.error('Metin özetleme hatası:', error);
            throw new Error('Metin özetlenemedi');
        }
    }

    static async translateText(text, sourceLanguage, targetLanguage) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Sen ${sourceLanguage} dilinden ${targetLanguage} diline çeviri yapan bir asistansın. 
                        Metni doğru ve anlaşılır bir şekilde çevir.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            });

            const translation = completion.choices[0].message.content;
            return translation;
        } catch (error) {
            logger.error('Çeviri hatası:', error);
            throw new Error('Metin çevrilemedi');
        }
    }

    static async analyzeTextDifficulty(text, language) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Sen ${language} dilinde metin zorluk seviyesi analizi yapan bir asistansın. 
                        Metnin zorluk seviyesini A1, A2, B1, B2, C1 veya C2 olarak belirle.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 50
            });

            const difficulty = completion.choices[0].message.content;
            return difficulty;
        } catch (error) {
            logger.error('Zorluk seviyesi analizi hatası:', error);
            throw new Error('Zorluk seviyesi analizi yapılamadı');
        }
    }
}

module.exports = AIService; 