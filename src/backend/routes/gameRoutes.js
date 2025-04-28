const express = require('express');
const router = express.Router();
const GameController = require('../controllers/gameController');
const { auth } = require('../middleware/auth');

// Tüm oyunları getir
router.get('/', GameController.getAllGames);

// Belirli bir oyunu getir
router.get('/:id', GameController.getGameById);

// Yeni oyun oluştur
router.post('/', auth, GameController.createGame);

// Oyun güncelle
router.put('/:id', auth, GameController.updateGame);

// Oyun sil
router.delete('/:id', auth, GameController.deleteGame);

// Kullanıcının oyunlarını getir
router.get('/user/:userId', auth, GameController.getUserGames);

module.exports = router;