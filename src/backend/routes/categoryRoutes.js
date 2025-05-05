const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryWords
} = require('../controllers/categoryController');

// Tüm kategorileri getir ve ana route
router.get('/', getAllCategories);

// Kategori detayını getir
router.get('/:id', getCategoryById);

// Yeni kategori ekle
router.post('/', auth, createCategory);

// Kategori güncelle
router.put('/:id', auth, updateCategory);

// Kategori sil
router.delete('/:id', auth, deleteCategory);

// Kategorideki kelimeleri getir
router.get('/:id/words', getCategoryWords);

module.exports = router; 