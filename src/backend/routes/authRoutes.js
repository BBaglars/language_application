const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Kimlik doğrulama işlemleri
router.post('/register', userController.createUser);

module.exports = router; 