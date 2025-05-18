const express = require('express');
const CategoryController = require('../controllers/categoryController.js');
const { authenticate } = require('../middleware/auth.middleware.js');
const { validateRequest } = require('../middleware/validation.middleware.js');
const { createCategorySchema, updateCategorySchema } = require('../validations/category.validation.js');

const router = express.Router();

// Tüm route'lar için authentication gerekli
// router.use(authenticate); // Geliştirme için geçici olarak yoruma alındı

// Kategori işlemleri
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategory);
router.post('/', validateRequest(createCategorySchema), CategoryController.createCategory);
router.put('/:id', validateRequest(updateCategorySchema), CategoryController.updateCategory);
router.patch('/:id', validateRequest(updateCategorySchema), CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router; 