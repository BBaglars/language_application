const express = require('express');
const router = express.Router();

// Oyun API'si henüz implement edilmedi
router.get('/', (req, res) => {
  res.json({ message: 'Oyun API\'si henüz implement edilmedi' });
});

module.exports = router;