const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Kullanıcı işlemleri
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Kullanıcı kelime ilerlemesi
router.get('/:id/word-progress', UserController.getUserWordProgress);
router.post('/:id/word-progress', UserController.updateWordProgress);

// Ana route'u tanımla
router.get('/', (req, res) => {
  res.json({ message: 'User API çalışıyor' });
});

module.exports = router; 