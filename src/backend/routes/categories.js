const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { AppError } = require('../utils/errors');

// Tüm kategorileri getir
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

// Yeni kategori oluştur
router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return next(new AppError('Kategori adı zorunludur', 400));
        }

        const { rows } = await pool.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

// Kategori güncelle
router.put('/:id', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        if (!name) {
            return next(new AppError('Kategori adı zorunludur', 400));
        }

        const { rows } = await pool.query(
            'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );

        if (rows.length === 0) {
            return next(new AppError('Kategori bulunamadı', 404));
        }

        res.json(rows[0]);
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

// Kategori sil
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            'DELETE FROM categories WHERE id = $1 RETURNING *',
            [id]
        );

        if (rows.length === 0) {
            return next(new AppError('Kategori bulunamadı', 404));
        }

        res.status(204).send();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

// Kategorideki kelimeleri getir
router.get('/:id/words', async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT w.* FROM words w
             JOIN word_categories wc ON w.id = wc.word_id
             WHERE wc.category_id = $1`,
            [id]
        );

        res.json(rows);
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

module.exports = router; 