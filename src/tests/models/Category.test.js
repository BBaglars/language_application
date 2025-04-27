const Category = require('../../models/Category');
const { pool } = require('../../db/db');

describe('Category Model (Gerçek Veritabanı)', () => {
    let createdCategoryId;
    let createdUserId;

    beforeAll(async () => {
        // Test için kullanıcı ekle
        const userRes = await pool.query("INSERT INTO users (firebase_uid, email, username) VALUES ('catuid', 'cat@example.com', 'catuser') RETURNING id");
        createdUserId = userRes.rows[0].id;
    });

    afterAll(async () => {
        // Testte eklenen kategorileri ve kullanıcıyı temizle
        if (createdCategoryId) {
            await pool.query('DELETE FROM categories WHERE id = $1', [createdCategoryId]);
        }
        if (createdUserId) {
            await pool.query('DELETE FROM users WHERE id = $1', [createdUserId]);
        }
    });

    it('should create a Category instance with correct properties', () => {
        const data = {
            id: 1,
            name: 'Test Category',
            description: 'Test Description',
            parent_id: null,
            created_by: 1,
            created_at: '2024-01-01',
            updated_at: '2024-01-02'
        };
        const category = new Category(data);
        expect(category.id).toBe(data.id);
        expect(category.name).toBe(data.name);
        expect(category.description).toBe(data.description);
        expect(category.parent_id).toBe(data.parent_id);
        expect(category.created_by).toBe(data.created_by);
        expect(category.created_at).toBe(data.created_at);
    });

    it('should create a new category', async () => {
        const category = new Category({ name: 'TestCat', description: 'Desc', parent_id: null, created_by: createdUserId });
        const newCategory = await category.save();
        expect(newCategory).toBeInstanceOf(Category);
        expect(newCategory.name).toBe('TestCat');
        createdCategoryId = newCategory.id;
    });

    it('should find a category by id', async () => {
        const category = await Category.findById(createdCategoryId);
        expect(category).toBeInstanceOf(Category);
        expect(category.id).toBe(createdCategoryId);
    });

    it('should return null when category not found by id', async () => {
        const category = await Category.findById(999999);
        expect(category).toBeNull();
    });

    it('should return an array of Category instances', async () => {
        const categories = await Category.findAll();
        expect(Array.isArray(categories)).toBe(true);
        if (categories.length > 0) {
            expect(categories[0]).toBeInstanceOf(Category);
        }
    });

    it('should update an existing category', async () => {
        let category = await Category.findById(createdCategoryId);
        category.name = 'UpdatedCat';
        const updatedCategory = await category.save();
        expect(updatedCategory).toBeInstanceOf(Category);
        expect(updatedCategory.name).toBe('UpdatedCat');
    });

    it('should delete a category', async () => {
        let category = await Category.findById(createdCategoryId);
        await category.delete();
        const deleted = await Category.findById(createdCategoryId);
        expect(deleted).toBeNull();
        createdCategoryId = null;
    });
}); 