const Category = require('../models/Category');
const logger = require('../utils/logger');
const { query } = require('../config/database');

class CategoryService {
    static async createCategory(categoryData) {
        try {
            const newCategory = await Category.create(categoryData);
            return newCategory;
        } catch (error) {
            logger.error('Kategori oluşturma hatası:', error);
            throw new Error('Kategori oluşturulamadı');
        }
    }

    static async getCategoryById(id) {
        try {
            const category = await Category.findById(id);
            if (!category) {
                throw new Error('Kategori bulunamadı');
            }
            return category;
        } catch (error) {
            logger.error('Kategori getirme hatası:', error);
            throw error;
        }
    }

    static async updateCategory(id, categoryData) {
        try {
            const updatedCategory = await Category.update(id, categoryData);
            if (!updatedCategory) {
                throw new Error('Kategori bulunamadı');
            }
            return updatedCategory;
        } catch (error) {
            logger.error('Kategori güncelleme hatası:', error);
            throw error;
        }
    }

    static async deleteCategory(id) {
        try {
            const result = await Category.delete(id);
            if (!result) {
                throw new Error('Kategori bulunamadı');
            }
            return true;
        } catch (error) {
            logger.error('Kategori silme hatası:', error);
            throw error;
        }
    }

    static async getSubCategories(parentId) {
        try {
            const subCategories = await query(
                'SELECT * FROM categories WHERE parent_id = ?',
                [parentId]
            );
            return subCategories;
        } catch (error) {
            logger.error('Alt kategorileri getirme hatası:', error);
            throw error;
        }
    }

    static async getCategoryTree() {
        try {
            const categories = await query(
                'SELECT * FROM categories ORDER BY parent_id, name'
            );
            
            const categoryMap = new Map();
            const rootCategories = [];

            // Tüm kategorileri bir map'e ekle
            categories.forEach(category => {
                category.children = [];
                categoryMap.set(category.id, category);
            });

            // Kategorileri hiyerarşik olarak düzenle
            categories.forEach(category => {
                if (category.parent_id) {
                    const parent = categoryMap.get(category.parent_id);
                    if (parent) {
                        parent.children.push(category);
                    }
                } else {
                    rootCategories.push(category);
                }
            });

            return rootCategories;
        } catch (error) {
            logger.error('Kategori ağacı oluşturma hatası:', error);
            throw error;
        }
    }

    static async addWordToCategory(categoryId, wordId) {
        try {
            const result = await query(
                'INSERT INTO word_categories (category_id, word_id) VALUES (?, ?)',
                [categoryId, wordId]
            );
            return result;
        } catch (error) {
            logger.error('Kategoriye kelime ekleme hatası:', error);
            throw error;
        }
    }

    static async removeWordFromCategory(categoryId, wordId) {
        try {
            const result = await query(
                'DELETE FROM word_categories WHERE category_id = ? AND word_id = ?',
                [categoryId, wordId]
            );
            return result;
        } catch (error) {
            logger.error('Kategoriden kelime çıkarma hatası:', error);
            throw error;
        }
    }

    static async getCategoryStatistics(categoryId) {
        try {
            const statistics = await query(
                `SELECT 
                    COUNT(DISTINCT w.id) as total_words,
                    COUNT(DISTINCT wc.word_id) as words_in_category,
                    COUNT(DISTINCT uwl.user_id) as total_users
                FROM categories c
                LEFT JOIN word_categories wc ON c.id = wc.category_id
                LEFT JOIN words w ON wc.word_id = w.id
                LEFT JOIN user_word_levels uwl ON w.id = uwl.word_id
                WHERE c.id = ?`,
                [categoryId]
            );
            return statistics[0];
        } catch (error) {
            logger.error('Kategori istatistikleri getirme hatası:', error);
            throw error;
        }
    }
}

module.exports = CategoryService; 