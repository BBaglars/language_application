const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');
const adminMiddleware = require('../middleware/admin.middleware');
const wordService = require('../services/word.service');
const categoryService = require('../services/category.service');
const { verifyFirebaseToken, checkAdminRole } = require('../middleware/auth.middleware');
const { validateSchema, adminSchema } = require('../middleware/validation.middleware');
const { catchAsync } = require('../middleware/error.middleware');
const Joi = require('joi');

// Admin yetkisi gerektiren tüm rotalar için middleware
router.use(adminMiddleware.requireAdmin);
router.use(adminMiddleware.logAdminAction);

// Admin oluşturma (sadece super_admin)
router.post('/',
    verifyFirebaseToken,
    checkAdminRole,
    validateSchema(adminSchema),
    catchAsync(async (req, res) => {
        const admin = await adminService.createAdmin(req.body);
        res.status(201).json({
            status: 'success',
            data: { admin }
        });
    })
);

// Admin bilgilerini getirme
router.get('/:id',
    verifyFirebaseToken,
    checkAdminRole,
    catchAsync(async (req, res) => {
        const admin = await adminService.getAdminById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { admin }
        });
    })
);

// Tüm adminleri getirme
router.get('/',
    verifyFirebaseToken,
    checkAdminRole,
    catchAsync(async (req, res) => {
        const admins = await adminService.getAllAdmins();
        res.status(200).json({
            status: 'success',
            data: { admins }
        });
    })
);

// Admin bilgilerini güncelleme
router.put('/:id',
    verifyFirebaseToken,
    checkAdminRole,
    validateSchema(adminSchema),
    catchAsync(async (req, res) => {
        const admin = await adminService.updateAdmin(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { admin }
        });
    })
);

// Admin silme
router.delete('/:id',
    verifyFirebaseToken,
    checkAdminRole,
    catchAsync(async (req, res) => {
        await adminService.deleteAdmin(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    })
);

// Admin loglarını getirme
router.get('/logs',
    verifyFirebaseToken,
    checkAdminRole,
    validateQuery({
        admin_id: Joi.number().optional(),
        action: Joi.string().optional(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        ...paginationSchema
    }),
    catchAsync(async (req, res) => {
        const logs = await adminService.getAdminLogs(req.query);
        res.status(200).json({
            status: 'success',
            data: { logs }
        });
    })
);

// Sistem istatistiklerini getirme
router.get('/stats',
    verifyFirebaseToken,
    checkAdminRole,
    catchAsync(async (req, res) => {
        const stats = await adminService.getSystemStats();
        res.status(200).json({
            status: 'success',
            data: { stats }
        });
    })
);

// Yedekleme işlemi
router.post('/backup',
    verifyFirebaseToken,
    checkAdminRole,
    catchAsync(async (req, res) => {
        const backup = await adminService.createBackup();
        res.status(201).json({
            status: 'success',
            data: { backup }
        });
    })
);

// Yedekleme geçmişini getirme
router.get('/backup-history',
    verifyFirebaseToken,
    checkAdminRole,
    validateQuery({
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        ...paginationSchema
    }),
    catchAsync(async (req, res) => {
        const history = await adminService.getBackupHistory(req.query);
        res.status(200).json({
            status: 'success',
            data: { history }
        });
    })
);

// Sistem ayarlarını getirme
router.get('/settings',
    verifyFirebaseToken,
    checkAdminRole,
    catchAsync(async (req, res) => {
        const settings = await adminService.getSystemSettings();
        res.status(200).json({
            status: 'success',
            data: { settings }
        });
    })
);

// Sistem ayarlarını güncelleme
router.put('/settings',
    verifyFirebaseToken,
    checkAdminRole,
    validateSchema({
        settings: Joi.object().required()
    }),
    catchAsync(async (req, res) => {
        const settings = await adminService.updateSystemSettings(req.body.settings);
        res.status(200).json({
            status: 'success',
            data: { settings }
        });
    })
);

// Kelime yönetimi
router.post('/words', adminMiddleware.requirePermission('manage_words'), async (req, res) => {
    try {
        const word = await wordService.addWord(req.admin.id, req.body);
        res.status(201).json(word);
    } catch (error) {
        res.status(500).json({ error: 'Kelime eklenemedi' });
    }
});

router.put('/words/:id', adminMiddleware.requirePermission('manage_words'), async (req, res) => {
    try {
        const word = await wordService.updateWord(req.params.id, req.body);
        res.json(word);
    } catch (error) {
        res.status(500).json({ error: 'Kelime güncellenemedi' });
    }
});

router.delete('/words/:id', adminMiddleware.requirePermission('manage_words'), async (req, res) => {
    try {
        await wordService.deleteWord(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Kelime silinemedi' });
    }
});

// Kategori yönetimi
router.post('/categories', adminMiddleware.requirePermission('manage_categories'), async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Kategori oluşturulamadı' });
    }
});

router.put('/categories/:id', adminMiddleware.requirePermission('manage_categories'), async (req, res) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Kategori güncellenemedi' });
    }
});

router.delete('/categories/:id', adminMiddleware.requirePermission('manage_categories'), async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Kategori silinemedi' });
    }
});

module.exports = router; 