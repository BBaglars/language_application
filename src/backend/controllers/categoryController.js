const { pool } = require('../db');
const { AppError } = require('../utils/errors');

// Tüm kategorileri getir
const getAllCategories = async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Kategori detayını getir
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);

        if (rows.length === 0) {
            return next(new AppError('Kategori bulunamadı', 404));
        }

        res.json(rows[0]);
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Yeni kategori ekle
const createCategory = async (req, res, next) => {
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
};

// Kategori güncelle
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

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
};

// Kategori sil
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            return next(new AppError('Kategori bulunamadı', 404));
        }

        res.status(204).send();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Kategorideki kelimeleri getir
const getCategoryWords = async (req, res, next) => {
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
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryWords
}; 