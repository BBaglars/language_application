const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Kelime ekleme
router.post('/',
  [
    body('word').notEmpty().trim(),
    body('translation').notEmpty().trim(),
    body('category').notEmpty().trim(),
    body('example').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { word, translation, category, example } = req.body;
      const userId = req.user.uid;

      const result = await db.query(
        `INSERT INTO words (user_id, word, translation, category, example)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, word, translation, category, example]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Word creation error:', error);
      res.status(500).json({ error: 'Kelime eklenirken bir hata oluştu' });
    }
  }
);

// Kullanıcının kelimelerini getirme
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const result = await db.query(
      'SELECT * FROM words WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Word fetch error:', error);
    res.status(500).json({ error: 'Kelimeler getirilirken bir hata oluştu' });
  }
});

// Kelime güncelleme
router.put('/:id',
  [
    body('word').optional().trim(),
    body('translation').optional().trim(),
    body('category').optional().trim(),
    body('example').optional().trim()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;
      const { word, translation, category, example } = req.body;

      const result = await db.query(
        `UPDATE words 
         SET word = COALESCE($1, word),
             translation = COALESCE($2, translation),
             category = COALESCE($3, category),
             example = COALESCE($4, example)
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [word, translation, category, example, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Kelime bulunamadı' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Word update error:', error);
      res.status(500).json({ error: 'Kelime güncellenirken bir hata oluştu' });
    }
  }
);

// Kelime silme
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const result = await db.query(
      'DELETE FROM words WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kelime bulunamadı' });
    }

    res.json({ message: 'Kelime başarıyla silindi' });
  } catch (error) {
    console.error('Word deletion error:', error);
    res.status(500).json({ error: 'Kelime silinirken bir hata oluştu' });
  }
});

module.exports = router; 