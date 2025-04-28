const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            }
        });
        
        res.status(201).json(user);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Bu kullanıcı adı veya email zaten kullanımda' });
        }
        res.status(400).json({ error: error.message });
    }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                username: true,
                email: true,
                password: true
            }
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
        }
        
        // Şifreyi yanıttan çıkar
        const { password: _, ...userWithoutPassword } = user;
        
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Kullanıcı bilgilerini getir
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.id) },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                words: {
                    select: {
                        id: true,
                        word: true,
                        meaning: true,
                        category: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                scores: {
                    select: {
                        id: true,
                        score: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                }
            }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 