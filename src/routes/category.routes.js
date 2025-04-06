const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, checkAdminRole } = require('../middleware/auth.middleware');
const { validateSchema, categorySchema, validateQuery, paginationSchema } = require('../middleware/validation.middleware');
const { catchAsync } = require('../middleware/error.middleware');
const CategoryService = require('../services/category.service');

// Kategori oluşturma (sadece admin)
router.post('/',
    verifyFirebaseToken,
    checkAdminRole,
    validateSchema(categorySchema),
    catchAsync(async (req, res) => {
        const category = await CategoryService.createCategory(req.body);
        res.status(201).json({
            status: 'success',
            data: { category }
        });
    })
);

// Kategori detaylarını getirme
router.get('/:id',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const category = await CategoryService.getCategoryById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { category }
        });
    })
);

// Tüm kategorileri getirme
router.get('/',
    verifyFirebaseToken,
    validateQuery(paginationSchema),
    catchAsync(async (req, res) => {
        const categories = await CategoryService.getAllCategories();
        res.status(200).json({
            status: 'success',
            data: { categories }
        });
    })
);

// Kategori güncelleme (sadece admin)
router.put('/:id',
    verifyFirebaseToken,
    checkAdminRole,
    validateSchema(categorySchema),
    catchAsync(async (req, res) => {
        const category = await CategoryService.updateCategory(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { category }
        });
    })
);

// Kategori silme (sadece admin)
router.delete('/:id',
    verifyFirebaseToken,
    checkAdminRole,
    catchAsync(async (req, res) => {
        await CategoryService.deleteCategory(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    })
);

// Kategori istatistiklerini getirme
router.get('/:id/stats',
    verifyFirebaseToken,
    catchAsync(async (req, res) => {
        const stats = await CategoryService.getCategoryStats(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { stats }
        });
    })
);

// Kategori arama
router.get('/search',
    verifyFirebaseToken,
    validateQuery({
        query: Joi.string().min(1).required(),
        ...paginationSchema
    }),
    catchAsync(async (req, res) => {
        const categories = await CategoryService.searchCategories(req.query.query);
        res.status(200).json({
            status: 'success',
            data: { categories }
        });
    })
);

// Kategoriye göre kelimeleri getirme
router.get('/:id/words',
    verifyFirebaseToken,
    validateQuery({ ...paginationSchema, ...filterSchema }),
    catchAsync(async (req, res) => {
        const words = await CategoryService.getWordsByCategory(req.params.id, req.query);
        res.status(200).json({
            status: 'success',
            data: { words }
        });
    })
);

// Otomatik kelime kategorizasyonu (sadece admin)
router.post('/:id/auto-categorize',
    verifyFirebaseToken,
    checkAdminRole,
    catchAsync(async (req, res) => {
        await CategoryService.autoCategorizeWords(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Kelimeler otomatik olarak kategorize edildi'
        });
    })
);

module.exports = router; 