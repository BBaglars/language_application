const { pool } = require('../config/database');

class Story {
  static async create({ title, content }) {
    try {
      const result = await pool.query(
        'INSERT INTO stories (title, content) VALUES ($1, $2) RETURNING *',
        [title, content]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT s.*, array_agg(DISTINCT jsonb_build_object(
           'id', w.id,
           'word', w.word,
           'meaning', w.meaning,
           'language', l.code
         )) as words
         FROM stories s
         LEFT JOIN story_words sw ON s.id = sw.story_id
         LEFT JOIN words w ON sw.word_id = w.id
         LEFT JOIN languages l ON w.language_id = l.id
         WHERE s.id = $1
         GROUP BY s.id`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll({ limit = 10, offset = 0 }) {
    try {
      const result = await pool.query(
        `SELECT s.*, COUNT(DISTINCT w.id) as word_count
         FROM stories s
         LEFT JOIN story_words sw ON s.id = sw.story_id
         LEFT JOIN words w ON sw.word_id = w.id
         GROUP BY s.id
         ORDER BY s.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, { title, content }) {
    try {
      const result = await pool.query(
        'UPDATE stories SET title = $1, content = $2 WHERE id = $3 RETURNING *',
        [title, content, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM stories WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async addWord(storyId, wordId) {
    try {
      const result = await pool.query(
        'INSERT INTO story_words (story_id, word_id) VALUES ($1, $2) RETURNING *',
        [storyId, wordId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async removeWord(storyId, wordId) {
    try {
      const result = await pool.query(
        'DELETE FROM story_words WHERE story_id = $1 AND word_id = $2 RETURNING *',
        [storyId, wordId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getWords(storyId) {
    try {
      const result = await pool.query(
        `SELECT w.*, l.code as language_code, l.name as language_name
         FROM story_words sw
         JOIN words w ON sw.word_id = w.id
         JOIN languages l ON w.language_id = l.id
         WHERE sw.story_id = $1
         ORDER BY w.word`,
        [storyId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Story; 