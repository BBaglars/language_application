const express = require('express');
const WordController = require('../controllers/wordController.js');
const { authenticate } = require('../middleware/auth.middleware.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { createWordSchema, updateWordSchema } = require('../validations/word.validation.js');

const router = express.Router();
const wordController = new WordController();

// Tüm route'lar için authentication gerekli
router.use(authenticate);

// Kelime işlemleri
router.get('/', wordController.getWords);
router.get('/:id', wordController.getWordById);
router.post('/', validateRequest(createWordSchema), wordController.createWord);
router.put('/:id', validateRequest(updateWordSchema), wordController.updateWord);
router.patch('/:id', validateRequest(updateWordSchema), wordController.updateWord);
router.delete('/:id', wordController.deleteWord);
router.post('/:id/categories/:categoryId', wordController.addWordToCategory);

// Toplu kelime anlamı getirme
router.post('/meanings', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids dizisi gerekli' });
    }
    const words = await require('../db').word.findMany({
      where: { id: { in: ids } },
      select: { id: true, text: true, meaning: true }
    });
    res.json({ meanings: words });
  } catch (error) {
    console.error('Toplu anlam getirme hatası:', error);
    res.status(500).json({ error: 'Anlamlar alınamadı' });
  }
});

module.exports = router; 