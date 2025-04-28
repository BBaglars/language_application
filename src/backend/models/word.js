const { pool } = require('../config/database');

class Word {
  static async create({ word, meaning, languageId, difficultyLevel }) {
    try {
      const result = await pool.query(
        'INSERT INTO words (word, meaning, language_id, difficulty_level) VALUES ($1, $2, $3, $4) RETURNING *',
        [word, meaning, languageId, difficultyLevel]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT w.*, l.code as language_code, l.name as language_name,
         array_agg(DISTINCT c.name) as categories,
         array_agg(DISTINCT es.sentence) as example_sentences
         FROM words w
         LEFT JOIN languages l ON w.language_id = l.id
         LEFT JOIN word_categories wc ON w.id = wc.word_id
         LEFT JOIN categories c ON wc.category_id = c.id
         LEFT JOIN example_sentences es ON w.id = es.word_id
         WHERE w.id = $1
         GROUP BY w.id, l.code, l.name`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, { word, meaning, languageId, difficultyLevel }) {
    try {
      const result = await pool.query(
        'UPDATE words SET word = $1, meaning = $2, language_id = $3, difficulty_level = $4 WHERE id = $5 RETURNING *',
        [word, meaning, languageId, difficultyLevel, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Kelime bulunamadı');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM words WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Kelime bulunamadı');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async addToCategory(wordId, categoryId) {
    try {
      const result = await pool.query(
        'INSERT INTO word_categories (word_id, category_id) VALUES ($1, $2) RETURNING *',
        [wordId, categoryId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async removeFromCategory(wordId, categoryId) {
    try {
      const result = await pool.query(
        'DELETE FROM word_categories WHERE word_id = $1 AND category_id = $2 RETURNING *',
        [wordId, categoryId]
      );

      if (result.rows.length === 0) {
        throw new Error('Kelime-kategori ilişkisi bulunamadı');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async addExampleSentence(wordId, sentence) {
    try {
      const result = await pool.query(
        'INSERT INTO example_sentences (word_id, sentence) VALUES ($1, $2) RETURNING *',
        [wordId, sentence]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async addTranslation(sourceWordId, targetWordId) {
    try {
      if (sourceWordId === targetWordId) {
        throw new Error('Bir kelime kendisine çeviri olarak eklenemez');
      }

      const result = await pool.query(
        'INSERT INTO translations (source_word_id, target_word_id) VALUES ($1, $2) RETURNING *',
        [sourceWordId, targetWordId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getTranslations(wordId) {
    try {
      const result = await pool.query(
        `SELECT w.*, l.code as language_code, l.name as language_name
         FROM translations t
         JOIN words w ON (t.target_word_id = w.id OR t.source_word_id = w.id)
         JOIN languages l ON w.language_id = l.id
         WHERE (t.source_word_id = $1 OR t.target_word_id = $1)
         AND w.id != $1`,
        [wordId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAll({ limit = 10, offset = 0, languageId, categoryId, difficultyLevel }) {
    try {
      let query = `
        SELECT DISTINCT w.*, l.code as language_code, l.name as language_name
        FROM words w
        LEFT JOIN languages l ON w.language_id = l.id
        LEFT JOIN word_categories wc ON w.id = wc.word_id
      `;
      
      const params = [];
      const conditions = [];
      
      if (languageId) {
        params.push(languageId);
        conditions.push(`w.language_id = $${params.length}`);
      }
      
      if (categoryId) {
        params.push(categoryId);
        conditions.push(`wc.category_id = $${params.length}`);
      }
      
      if (difficultyLevel) {
        params.push(difficultyLevel);
        conditions.push(`w.difficulty_level = $${params.length}`);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ` ORDER BY w.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Word; 