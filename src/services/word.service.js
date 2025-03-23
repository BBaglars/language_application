const db = require('../config/database');

class WordService {
    async addWord(userId, wordData) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Ana kelimeyi ekle
            const wordResult = await client.query(
                `INSERT INTO words (user_id, base_word, language_level_id)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [userId, wordData.baseWord, wordData.languageLevelId]
            );

            const wordId = wordResult.rows[0].id;

            // Her dil için çeviriyi ekle
            for (const translation of wordData.translations) {
                await client.query(
                    `INSERT INTO word_translations 
                     (word_id, language_id, translation, example)
                     VALUES ($1, $2, $3, $4)`,
                    [wordId, translation.languageId, translation.text, translation.example]
                );
            }

            // Kategorileri ekle
            for (const categoryId of wordData.categoryIds) {
                await client.query(
                    `INSERT INTO word_categories (word_id, category_id)
                     VALUES ($1, $2)`,
                    [wordId, categoryId]
                );
            }

            // Kullanıcı kelime seviyesi kaydı oluştur
            await client.query(
                `INSERT INTO user_word_levels 
                 (user_id, word_id, mastery_level)
                 VALUES ($1, $2, 0)`,
                [userId, wordId]
            );

            await client.query('COMMIT');

            // Eklenen kelimeyi tüm detaylarıyla getir
            return this.getWordById(wordId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getWordById(wordId) {
        const result = await db.query(
            `SELECT w.*, 
                    l.code as level_code,
                    l.name as level_name,
                    json_agg(DISTINCT jsonb_build_object(
                        'languageId', wt.language_id,
                        'translation', wt.translation,
                        'example', wt.example
                    )) as translations,
                    json_agg(DISTINCT jsonb_build_object(
                        'categoryId', c.id,
                        'name', c.name
                    )) as categories
             FROM words w
             LEFT JOIN word_translations wt ON w.id = wt.word_id
             LEFT JOIN word_categories wc ON w.id = wc.word_id
             LEFT JOIN categories c ON wc.category_id = c.id
             LEFT JOIN language_levels l ON w.language_level_id = l.id
             WHERE w.id = $1
             GROUP BY w.id, l.code, l.name`,
            [wordId]
        );

        return result.rows[0];
    }

    async getWordsByUser(userId, filters = {}) {
        let query = `
            SELECT w.*, 
                    l.code as level_code,
                    l.name as level_name,
                    uwl.mastery_level,
                    uwl.last_reviewed,
                    uwl.next_review,
                    json_agg(DISTINCT jsonb_build_object(
                        'languageId', wt.language_id,
                        'translation', wt.translation,
                        'example', wt.example
                    )) as translations,
                    json_agg(DISTINCT jsonb_build_object(
                        'categoryId', c.id,
                        'name', c.name
                    )) as categories
             FROM words w
             LEFT JOIN word_translations wt ON w.id = wt.word_id
             LEFT JOIN word_categories wc ON w.id = wc.word_id
             LEFT JOIN categories c ON wc.category_id = c.id
             LEFT JOIN language_levels l ON w.language_level_id = l.id
             LEFT JOIN user_word_levels uwl ON w.id = uwl.word_id AND uwl.user_id = $1
             WHERE w.user_id = $1
        `;
        const params = [userId];

        // Filtreleri uygula
        if (filters.letterCount) {
            query += ' AND w.letter_count = $' + (params.length + 1);
            params.push(filters.letterCount);
        }

        if (filters.languageLevelId) {
            query += ' AND w.language_level_id = $' + (params.length + 1);
            params.push(filters.languageLevelId);
        }

        if (filters.categoryId) {
            query += ' AND EXISTS (SELECT 1 FROM word_categories wc2 WHERE wc2.word_id = w.id AND wc2.category_id = $' + (params.length + 1) + ')';
            params.push(filters.categoryId);
        }

        if (filters.minMasteryLevel !== undefined) {
            query += ' AND uwl.mastery_level >= $' + (params.length + 1);
            params.push(filters.minMasteryLevel);
        }

        query += ' GROUP BY w.id, l.code, l.name, uwl.mastery_level, uwl.last_reviewed, uwl.next_review ORDER BY w.created_at DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    async updateWord(wordId, wordData) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Ana kelimeyi güncelle
            if (wordData.baseWord || wordData.languageLevelId) {
                const updates = [];
                const values = [];
                let paramCount = 1;

                if (wordData.baseWord) {
                    updates.push(`base_word = $${paramCount}`);
                    values.push(wordData.baseWord);
                    paramCount++;
                }

                if (wordData.languageLevelId) {
                    updates.push(`language_level_id = $${paramCount}`);
                    values.push(wordData.languageLevelId);
                    paramCount++;
                }

                values.push(wordId);

                await client.query(
                    `UPDATE words 
                     SET ${updates.join(', ')}
                     WHERE id = $${paramCount}`,
                    values
                );
            }

            // Çevirileri güncelle
            if (wordData.translations) {
                await client.query(
                    'DELETE FROM word_translations WHERE word_id = $1',
                    [wordId]
                );

                for (const translation of wordData.translations) {
                    await client.query(
                        `INSERT INTO word_translations 
                         (word_id, language_id, translation, example)
                         VALUES ($1, $2, $3, $4)`,
                        [wordId, translation.languageId, translation.text, translation.example]
                    );
                }
            }

            // Kategorileri güncelle
            if (wordData.categoryIds) {
                await client.query(
                    'DELETE FROM word_categories WHERE word_id = $1',
                    [wordId]
                );

                for (const categoryId of wordData.categoryIds) {
                    await client.query(
                        `INSERT INTO word_categories (word_id, category_id)
                         VALUES ($1, $2)`,
                        [wordId, categoryId]
                    );
                }
            }

            await client.query('COMMIT');
            return this.getWordById(wordId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateWordMastery(userId, wordId, masteryLevel) {
        const result = await db.query(
            `UPDATE user_word_levels 
             SET mastery_level = $1,
                 last_reviewed = CURRENT_TIMESTAMP,
                 next_review = CURRENT_TIMESTAMP + INTERVAL '1 day' * 
                    CASE 
                        WHEN $1 >= 90 THEN 7
                        WHEN $1 >= 70 THEN 3
                        ELSE 1
                    END
             WHERE user_id = $2 AND word_id = $3
             RETURNING *`,
            [masteryLevel, userId, wordId]
        );

        return result.rows[0];
    }

    async getWordsForGame(userId, gameTypeId) {
        const gameType = await db.query(
            `SELECT * FROM game_types WHERE id = $1`,
            [gameTypeId]
        );

        if (!gameType.rows[0]) {
            throw new Error('Oyun tipi bulunamadı');
        }

        const result = await db.query(
            `SELECT w.*, 
                    wt.translation,
                    wt.example,
                    uwl.mastery_level
             FROM words w
             JOIN word_translations wt ON w.id = wt.word_id
             JOIN user_word_levels uwl ON w.id = uwl.word_id
             WHERE w.user_id = $1
             AND w.letter_count BETWEEN $2 AND $3
             AND w.language_level_id BETWEEN $4 AND $5
             AND uwl.mastery_level < 100
             ORDER BY RANDOM()
             LIMIT 10`,
            [
                userId,
                gameType.rows[0].min_letter_count,
                gameType.rows[0].max_letter_count,
                gameType.rows[0].min_level_id,
                gameType.rows[0].max_level_id
            ]
        );

        return result.rows;
    }

    async deleteWord(wordId) {
        // CASCADE ile ilişkili kayıtlar otomatik silinecek
        await db.query(
            'DELETE FROM words WHERE id = $1',
            [wordId]
        );
    }
}

module.exports = new WordService(); 