const WordService = require('../../services/WordService');
const { pool } = require('../../db');
const logger = require('../../utils/logger');

jest.mock('../../db');
jest.mock('../../utils/logger');

describe('WordService', () => {
    let mockConnection;
    let mockQuery;

    beforeEach(() => {
        mockQuery = jest.fn();
        mockConnection = {
            query: mockQuery,
            release: jest.fn()
        };
        pool.getConnection.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createWord', () => {
        it('should create a new word successfully', async () => {
            const wordData = {
                word: 'test',
                language_id: 1,
                difficulty_level: 'A1',
                created_by: 1
            };

            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

            const result = await WordService.createWord(wordData);

            expect(result).toBe(1);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO words'),
                expect.arrayContaining([wordData.word, wordData.language_id, wordData.difficulty_level, wordData.created_by])
            );
        });

        it('should throw error when word creation fails', async () => {
            const wordData = {
                word: 'test',
                language_id: 1,
                difficulty_level: 'A1',
                created_by: 1
            };

            mockQuery.mockRejectedValueOnce(new Error('Database error'));

            await expect(WordService.createWord(wordData)).rejects.toThrow('Database error');
        });
    });

    describe('getWordById', () => {
        it('should return word by id', async () => {
            const mockWord = {
                id: 1,
                word: 'test',
                language_id: 1,
                difficulty_level: 'A1'
            };

            mockQuery.mockResolvedValueOnce([mockWord]);

            const result = await WordService.getWordById(1);

            expect(result).toEqual(mockWord);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM words'),
                expect.arrayContaining([1])
            );
        });

        it('should return null when word not found', async () => {
            mockQuery.mockResolvedValueOnce([]);

            const result = await WordService.getWordById(999);

            expect(result).toBeNull();
        });
    });

    describe('updateWord', () => {
        it('should update word successfully', async () => {
            const wordData = {
                word: 'updated',
                difficulty_level: 'A2'
            };

            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await WordService.updateWord(1, wordData);

            expect(result).toBe(true);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE words'),
                expect.arrayContaining([wordData.word, wordData.difficulty_level, 1])
            );
        });

        it('should return false when word not found', async () => {
            const wordData = {
                word: 'updated',
                difficulty_level: 'A2'
            };

            mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const result = await WordService.updateWord(999, wordData);

            expect(result).toBe(false);
        });
    });

    describe('deleteWord', () => {
        it('should delete word successfully', async () => {
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await WordService.deleteWord(1);

            expect(result).toBe(true);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM words'),
                expect.arrayContaining([1])
            );
        });

        it('should return false when word not found', async () => {
            mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const result = await WordService.deleteWord(999);

            expect(result).toBe(false);
        });
    });

    describe('getWordsByLanguage', () => {
        it('should return words by language with pagination', async () => {
            const mockWords = [
                { id: 1, word: 'test1' },
                { id: 2, word: 'test2' }
            ];

            mockQuery.mockResolvedValueOnce([mockWords]);
            mockQuery.mockResolvedValueOnce([{ total: 2 }]);

            const result = await WordService.getWordsByLanguage(1, 1, 10);

            expect(result).toEqual({
                words: mockWords,
                total: 2,
                page: 1,
                limit: 10
            });
        });
    });

    describe('getWordsByCategory', () => {
        it('should return words by category with pagination', async () => {
            const mockWords = [
                { id: 1, word: 'test1' },
                { id: 2, word: 'test2' }
            ];

            mockQuery.mockResolvedValueOnce([mockWords]);
            mockQuery.mockResolvedValueOnce([{ total: 2 }]);

            const result = await WordService.getWordsByCategory(1, 1, 10);

            expect(result).toEqual({
                words: mockWords,
                total: 2,
                page: 1,
                limit: 10
            });
        });
    });
}); 