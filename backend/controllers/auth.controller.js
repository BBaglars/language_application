const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt.js');
const { AuthenticationError, ValidationError } = require('../utils/errors.js');
const logger = require('../utils/logger.js');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const register = async (req, res, next) => {
    try {
        const { email, firebaseId, name } = req.body;

        // Email ve firebaseId kontrolü
        if (!email || !firebaseId) {
            throw new ValidationError('Email ve firebaseId zorunludur');
        }

        // Email formatı kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError('Geçersiz email formatı');
        }

        // Email benzersizlik kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new ValidationError('Bu email adresi zaten kullanımda');
        }

        // FirebaseId benzersizlik kontrolü
        const existingFirebaseUser = await prisma.user.findUnique({
            where: { firebaseId }
        });

        if (existingFirebaseUser) {
            throw new ValidationError('Bu Firebase ID zaten kullanımda');
        }

        // Kullanıcı oluşturma
        const user = await prisma.user.create({
            data: {
                email,
                firebaseId,
                name: name || null,
                role: 'USER'
            }
        });

        // Token oluşturma
        const token = generateToken(user.id);

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    firebaseId: user.firebaseId,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { firebaseId } = req.body;

        if (!firebaseId) {
            throw new ValidationError('Firebase ID zorunludur');
        }

        // Kullanıcı kontrolü
        const user = await prisma.user.findUnique({
            where: { firebaseId }
        });

        if (!user) {
            throw new AuthenticationError('Geçersiz Firebase ID');
        }

        // Token oluşturma
        const token = generateToken(user.id);

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    firebaseId: user.firebaseId,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res) => {
    res.json({
        status: 'success',
        message: 'Başarıyla çıkış yapıldı'
    });
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AuthenticationError('Refresh token gerekli');
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newToken = generateToken(decoded.id);

        res.json({
            status: 'success',
            data: {
                token: newToken
            }
        });
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                stories: true,
                wordProgress: true,
                gameResults: true,
                generationJobs: true,
                generationCriteria: true
            }
        });

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Kullanıcı bulunamadı' 
            });
        }

        res.json({ 
            status: 'success',
            data: { user } 
        });
    } catch (error) {
        console.error('Kullanıcı bilgisi alma hatası:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Sunucu hatası' 
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    getCurrentUser
};