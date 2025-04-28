const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');

// Test için basit bir login endpoint'i
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Test için basit bir doğrulama
    if (username === 'test' && password === 'test') {
        const token = generateToken({ id: 1, username: 'test' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
});

// Kullanıcı bilgilerini getir
router.get('/me', auth, (req, res) => {
    res.json(req.user);
});

module.exports = router; 