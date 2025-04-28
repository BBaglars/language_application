const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Kullanıcı işlemleri
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Kullanıcı kelime ilerlemesi
router.get('/:id/word-progress', userController.getUserWordProgress);
router.post('/:id/word-progress', userController.updateWordProgress);

module.exports = router; 