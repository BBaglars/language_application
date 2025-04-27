const AIService = require('../../services/AIService');
const Word = require('../../models/Word');
const Language = require('../../models/Language');
const WordTranslation = require('../../models/WordTranslation');

// Mock the models
jest.mock('../../models/Word');
jest.mock('../../models/Language');
jest.mock('../../models/WordTranslation');

describe('AIService', () => {
    let aiService;

    beforeEach(() => {
        aiService = new AIService();
        jest.clearAllMocks();
    });

    describe('generateWord', () => {
        it('should generate a word and save it with translations', async () => {
            // Mock language
            const mockLanguage = { id: 1, code: 'en', name: 'English' };
            Language.findById.mockResolvedValue(mockLanguage);

            // Mock word creation
            const mockWord = {
                id: 1,
                word: 'test',
                language_id: 1,
                difficulty_level: 1,
                addTranslation: jest.fn().mockResolvedValue(true)
            };
            Word.prototype.save.mockResolvedValue(mockWord);

            // Mock translations
            const mockTranslations = [
                { language_id: 2, translation: 'test_tr' },
                { language_id: 3, translation: 'test_fr' }
            ];

            const result = await aiService.generateWord({
                word: 'test',
                languageId: 1,
                difficultyLevel: 1,
                createdBy: 1,
                translations: mockTranslations
            });

            expect(result).toBe(mockWord);
            expect(Word.prototype.save).toHaveBeenCalled();
            expect(mockWord.addTranslation).toHaveBeenCalledTimes(mockTranslations.length);
        });

        it('should throw error if language not found', async () => {
            Language.findById.mockResolvedValue(null);

            await expect(aiService.generateWord({
                word: 'test',
                languageId: 1,
                difficultyLevel: 1,
                createdBy: 1,
                translations: []
            })).rejects.toThrow('Language not found');
        });
    });

    describe('generateWordSuggestions', () => {
        it('should generate word suggestions', async () => {
            const mockLanguage = { id: 1, code: 'en', name: 'English' };
            Language.findById.mockResolvedValue(mockLanguage);

            const suggestions = await aiService.generateWordSuggestions({
                languageId: 1,
                difficultyLevel: 1,
                count: 5
            });

            expect(Array.isArray(suggestions)).toBe(true);
            expect(suggestions.length).toBeLessThanOrEqual(5);
            suggestions.forEach(suggestion => {
                expect(suggestion).toHaveProperty('word');
                expect(suggestion).toHaveProperty('translations');
            });
        });

        it('should throw error if language not found', async () => {
            Language.findById.mockResolvedValue(null);

            await expect(aiService.generateWordSuggestions({
                languageId: 1,
                difficultyLevel: 1,
                count: 5
            })).rejects.toThrow('Language not found');
        });
    });

    describe('generateTranslations', () => {
        it('should generate translations for a word', async () => {
            const mockWord = { id: 1, word: 'test', language_id: 1 };
            const mockTargetLanguages = [
                { id: 2, code: 'tr', name: 'Turkish' },
                { id: 3, code: 'fr', name: 'French' }
            ];

            Word.findById.mockResolvedValue(mockWord);
            Language.findById.mockResolvedValue({ id: 1, code: 'en', name: 'English' });

            const translations = await aiService.generateTranslations({
                wordId: 1,
                targetLanguageIds: [2, 3]
            });

            expect(Array.isArray(translations)).toBe(true);
            translations.forEach(translation => {
                expect(translation).toHaveProperty('languageId');
                expect(translation).toHaveProperty('translation');
            });
        });

        it('should throw error if word not found', async () => {
            Word.findById.mockResolvedValue(null);

            await expect(aiService.generateTranslations({
                wordId: 1,
                targetLanguageIds: [2, 3]
            })).rejects.toThrow('Word not found');
        });
    });

    describe('checkTranslation', () => {
        it('should check if translation is correct', async () => {
            const mockWord = { id: 1, word: 'test', language_id: 1 };
            const mockTranslation = { id: 1, word_id: 1, language_id: 2, translation: 'test_tr' };

            Word.findById.mockResolvedValue(mockWord);
            WordTranslation.findById.mockResolvedValue(mockTranslation);

            const result = await aiService.checkTranslation({
                wordId: 1,
                translationId: 1,
                userTranslation: 'test_tr'
            });

            expect(result).toHaveProperty('isCorrect');
            expect(result).toHaveProperty('explanation');
        });

        it('should throw error if word or translation not found', async () => {
            Word.findById.mockResolvedValue(null);

            await expect(aiService.checkTranslation({
                wordId: 1,
                translationId: 1,
                userTranslation: 'test'
            })).rejects.toThrow('Word not found');
        });
    });
}); 