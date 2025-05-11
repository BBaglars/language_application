const express = require('express');
const { register, login, logout, refreshToken } = require('../controllers/auth.controller.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { registerSchema, loginSchema } = require('../validations/auth.validation.js');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

module.exports = router; 