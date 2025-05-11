const express = require('express');
const { getCurrentUser } = require('../controllers/user.controller.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.use(authenticate);

router.get('/me', getCurrentUser);

module.exports = router; 