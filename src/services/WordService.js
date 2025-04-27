const { pool } = require('../db');
const logger = require('../utils/logger');
const { query } = require('../config/database');

class WordService {
    static async createWord(wordData) {
        try {
            const { word, language_id, difficulty_level, created_by } = wordData;
            const result = await pool.query(
                'INSERT INTO words (word, language_id, difficulty_level, created_by) VALUES ($1, $2, $3, $4) RETURNING id',
                [word, language_id, difficulty_level, created_by]
            );
            return result.rows[0].id;
        } catch (error) {
            logger.error('Kelime oluşturma hatası:', error);
            throw error;
        }
    }

    static async getWordById(id) {
        try {
            const result = await pool.query('SELECT * FROM words WHERE id = $1', [id]);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Kelime getirme hatası:', error);
            throw error;
        }
    }

    static async updateWord(id, wordData) {
        try {
            const { word, difficulty_level } = wordData;
            if (!word || !difficulty_level) {
                throw new Error('word ve difficulty_level zorunlu');
            }
            const result = await pool.query(
                'UPDATE words SET word = $1, difficulty_level = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
                [word, difficulty_level, id]
            );
            if (result.rows.length === 0) return false;
            return true;
        } catch (error) {
            logger.error('Kelime güncelleme hatası:', error);
            throw error;
        }
    }

    static async deleteWord(id) {
        try {
            const result = await pool.query('DELETE FROM words WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return false;
            return true;
        } catch (error) {
            logger.error('Kelime silme hatası:', error);
            throw error;
        }
    }

    static async getWordsByLanguage(languageId, filters = {}) {
        try {
            const page = parseInt(filters.page, 10) || 1;
            const limit = parseInt(filters.limit, 10) || 10;
            const offset = (page - 1) * limit;
            let query = 'SELECT * FROM words WHERE language_id = $1';
            const queryParams = [languageId];
            let paramCount = 2;

            // Filtreleri uygula
            if (filters.difficulty_level) {
                query += ` AND difficulty_level = $${paramCount}`;
                queryParams.push(filters.difficulty_level);
                paramCount++;
            }

            if (filters.min_letters) {
                query += ` AND letter_count >= $${paramCount}`;
                queryParams.push(filters.min_letters);
                paramCount++;
            }

            if (filters.max_letters) {
                query += ` AND letter_count <= $${paramCount}`;
                queryParams.push(filters.max_letters);
                paramCount++;
            }

            // Sayfalama
            query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            queryParams.push(limit, offset);

            const result = await pool.query(query, queryParams);
            const totalResult = await pool.query('SELECT COUNT(*) FROM words WHERE language_id = $1', [languageId]);
            
            return {
                words: result.rows,
                total: parseInt(totalResult.rows[0].count),
                page,
                limit
            };
        } catch (error) {
            logger.error('Dile göre kelimeleri getirme hatası:', error);
            throw error;
        }
    }

    static async getWordsByCategory(categoryId, page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            let query = `
                SELECT w.* FROM words w
                JOIN word_categories wc ON w.id = wc.word_id
                WHERE wc.category_id = $1
            `;
            const queryParams = [categoryId];
            let paramCount = 2;

            // Filtreleri uygula
            if (filters.difficulty_level) {
                query += ` AND w.difficulty_level = $${paramCount}`;
                queryParams.push(filters.difficulty_level);
                paramCount++;
            }

            if (filters.min_letters) {
                query += ` AND w.letter_count >= $${paramCount}`;
                queryParams.push(filters.min_letters);
                paramCount++;
            }

            if (filters.max_letters) {
                query += ` AND w.letter_count <= $${paramCount}`;
                queryParams.push(filters.max_letters);
                paramCount++;
            }

            // Sayfalama
            query += ` ORDER BY w.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            queryParams.push(limit, offset);

            const result = await pool.query(query, queryParams);
            const totalResult = await pool.query(
                'SELECT COUNT(*) FROM word_categories WHERE category_id = $1',
                [categoryId]
            );
            
            return {
                words: result.rows,
                total: parseInt(totalResult.rows[0].count),
                page,
                limit
            };
        } catch (error) {
            logger.error('Kategoriye göre kelimeleri getirme hatası:', error);
            throw error;
        }
    }

    static async getWordStats() {
        try {
            const result = await pool.query(`
                SELECT 
                    language_id,
                    difficulty_level,
                    COUNT(*) as total_words,
                    AVG(letter_count) as avg_letters,
                    MIN(letter_count) as min_letters,
                    MAX(letter_count) as max_letters
                FROM words
                GROUP BY language_id, difficulty_level
            `);
            return result.rows;
        } catch (error) {
            logger.error('Kelime istatistiklerini getirme hatası:', error);
            throw error;
        }
    }

    static async getWordsByLevel(level, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const words = await query(
                'SELECT * FROM words WHERE difficulty_level = ? LIMIT ? OFFSET ?',
                [level, limit, offset]
            );
            return words;
        } catch (error) {
            logger.error('Seviyeye göre kelime getirme hatası:', error);
            throw error;
        }
    }

    static async addTranslation(wordId, languageId, translation) {
        try {
            const result = await query(
                'INSERT INTO word_translations (word_id, language_id, translation) VALUES (?, ?, ?)',
                [wordId, languageId, translation]
            );
            return result;
        } catch (error) {
            logger.error('Çeviri ekleme hatası:', error);
            throw error;
        }
    }

    static async getTranslations(wordId) {
        try {
            const translations = await query(
                'SELECT * FROM word_translations WHERE word_id = ?',
                [wordId]
            );
            return translations;
        } catch (error) {
            logger.error('Çevirileri getirme hatası:', error);
            throw error;
        }
    }

    static async searchWords(query, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const words = await query(
                'SELECT * FROM words WHERE word LIKE ? LIMIT ? OFFSET ?',
                [`%${query}%`, limit, offset]
            );
            return words;
        } catch (error) {
            logger.error('Kelime arama hatası:', error);
            throw error;
        }
    }

    static async getWordStatistics(wordId) {
        try {
            const statistics = await query(
                `SELECT 
                    COUNT(DISTINCT user_id) as total_users,
                    AVG(mastery_level) as average_mastery,
                    COUNT(CASE WHEN mastery_level = 'C2' THEN 1 END) as mastered_count
                FROM user_word_levels 
                WHERE word_id = ?`,
                [wordId]
            );
            return statistics[0];
        } catch (error) {
            logger.error('Kelime istatistikleri getirme hatası:', error);
            throw error;
        }
    }
}

module.exports = WordService; 