const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tüm kelimeleri getir
router.get('/', async (req, res) => {
    try {
        const words = await prisma.word.findMany({
            include: {
                category: true
            }
        });
        res.json(words);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Yeni kelime ekle
router.post('/', async (req, res) => {
    try {
        const { word, meaning, categoryId } = req.body;
        const newWord = await prisma.word.create({
            data: {
                word,
                meaning,
                categoryId: parseInt(categoryId)
            }
        });
        res.status(201).json(newWord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Kelime güncelle
router.put('/:id', async (req, res) => {
    try {
        const { word, meaning, categoryId } = req.body;
        const updatedWord = await prisma.word.update({
            where: { id: parseInt(req.params.id) },
            data: {
                word,
                meaning,
                categoryId: parseInt(categoryId)
            }
        });
        res.json(updatedWord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Kelime sil
router.delete('/:id', async (req, res) => {
    try {
        await prisma.word.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Kelime başarıyla silindi' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 