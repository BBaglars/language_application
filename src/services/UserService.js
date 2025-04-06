const User = require('../models/User');
const logger = require('../utils/logger');
const { query } = require('../config/database');

class UserService {
    static async getUserProfile(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }
            return user;
        } catch (error) {
            logger.error('Kullanıcı profili getirme hatası:', error);
            throw error;
        }
    }

    static async updateUserProfile(userId, profileData) {
        try {
            const updatedUser = await User.update(userId, profileData);
            if (!updatedUser) {
                throw new Error('Kullanıcı bulunamadı');
            }
            return updatedUser;
        } catch (error) {
            logger.error('Kullanıcı profili güncelleme hatası:', error);
            throw error;
        }
    }

    static async getUserStats(userId) {
        try {
            const stats = await query(
                `SELECT 
                    (SELECT COUNT(*) FROM game_sessions WHERE user_id = ?) as total_games,
                    (SELECT AVG(score) FROM game_sessions WHERE user_id = ?) as average_score,
                    (SELECT COUNT(*) FROM user_word_levels WHERE user_id = ?) as total_words,
                    (SELECT COUNT(*) FROM user_achievements WHERE user_id = ?) as total_achievements
                `,
                [userId, userId, userId, userId]
            );
            return stats[0];
        } catch (error) {
            logger.error('Kullanıcı istatistiklerini getirme hatası:', error);
            throw error;
        }
    }

    static async getUserAchievements(userId) {
        try {
            const achievements = await query(
                `SELECT a.*, ua.earned_at 
                FROM achievements a
                JOIN user_achievements ua ON a.id = ua.achievement_id
                WHERE ua.user_id = ?`,
                [userId]
            );
            return achievements;
        } catch (error) {
            logger.error('Kullanıcı başarılarını getirme hatası:', error);
            throw error;
        }
    }

    static async getUserProgress(userId, languageId, categoryId, level) {
        try {
            let queryStr = `
                SELECT 
                    COUNT(DISTINCT w.id) as total_words,
                    COUNT(DISTINCT uwl.word_id) as learned_words,
                    AVG(CASE WHEN uwl.mastery_level = 'C2' THEN 1 ELSE 0 END) as mastery_rate
                FROM words w
                LEFT JOIN user_word_levels uwl ON w.id = uwl.word_id AND uwl.user_id = ?
                WHERE w.language_id = ?
            `;
            const params = [userId, languageId];

            if (categoryId) {
                queryStr += ' AND w.id IN (SELECT word_id FROM word_categories WHERE category_id = ?)';
                params.push(categoryId);
            }

            if (level) {
                queryStr += ' AND w.difficulty_level = ?';
                params.push(level);
            }

            const progress = await query(queryStr, params);
            return progress[0];
        } catch (error) {
            logger.error('Kullanıcı ilerlemesini getirme hatası:', error);
            throw error;
        }
    }

    static async getUserWordList(userId, filters = {}) {
        try {
            let queryStr = `
                SELECT 
                    w.*,
                    uwl.mastery_level,
                    uwl.next_review_date
                FROM words w
                LEFT JOIN user_word_levels uwl ON w.id = uwl.word_id AND uwl.user_id = ?
                WHERE 1=1
            `;
            const params = [userId];

            if (filters.language_id) {
                queryStr += ' AND w.language_id = ?';
                params.push(filters.language_id);
            }

            if (filters.category_id) {
                queryStr += ' AND w.id IN (SELECT word_id FROM word_categories WHERE category_id = ?)';
                params.push(filters.category_id);
            }

            if (filters.level) {
                queryStr += ' AND w.difficulty_level = ?';
                params.push(filters.level);
            }

            if (filters.mastery_level) {
                queryStr += ' AND uwl.mastery_level = ?';
                params.push(filters.mastery_level);
            }

            queryStr += ' ORDER BY w.word LIMIT ? OFFSET ?';
            params.push(filters.limit || 10, (filters.page - 1) * (filters.limit || 10));

            const words = await query(queryStr, params);
            return words;
        } catch (error) {
            logger.error('Kullanıcı kelime listesini getirme hatası:', error);
            throw error;
        }
    }

    static async getUserActivityLogs(userId, filters = {}) {
        try {
            let queryStr = 'SELECT * FROM user_activity_logs WHERE user_id = ?';
            const params = [userId];

            if (filters.start_date) {
                queryStr += ' AND created_at >= ?';
                params.push(filters.start_date);
            }

            if (filters.end_date) {
                queryStr += ' AND created_at <= ?';
                params.push(filters.end_date);
            }

            if (filters.activity_type) {
                queryStr += ' AND activity_type = ?';
                params.push(filters.activity_type);
            }

            queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(filters.limit || 10, (filters.page - 1) * (filters.limit || 10));

            const logs = await query(queryStr, params);
            return logs;
        } catch (error) {
            logger.error('Kullanıcı aktivite loglarını getirme hatası:', error);
            throw error;
        }
    }

    static async getUserSettings(userId) {
        try {
            const settings = await query(
                'SELECT * FROM user_settings WHERE user_id = ?',
                [userId]
            );
            return settings[0] || {};
        } catch (error) {
            logger.error('Kullanıcı ayarlarını getirme hatası:', error);
            throw error;
        }
    }

    static async updateUserSettings(userId, settings) {
        try {
            await query(
                'INSERT INTO user_settings (user_id, settings) VALUES (?, ?) ON DUPLICATE KEY UPDATE settings = ?',
                [userId, JSON.stringify(settings), JSON.stringify(settings)]
            );
            return true;
        } catch (error) {
            logger.error('Kullanıcı ayarlarını güncelleme hatası:', error);
            throw error;
        }
    }

    static async getUserNotifications(userId, filters = {}) {
        try {
            let queryStr = 'SELECT * FROM notifications WHERE user_id = ?';
            const params = [userId];

            if (filters.read !== undefined) {
                queryStr += ' AND is_read = ?';
                params.push(filters.read);
            }

            queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(filters.limit || 10, (filters.page - 1) * (filters.limit || 10));

            const notifications = await query(queryStr, params);
            return notifications;
        } catch (error) {
            logger.error('Kullanıcı bildirimlerini getirme hatası:', error);
            throw error;
        }
    }

    static async markNotificationsAsRead(userId, notificationIds) {
        try {
            await query(
                'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND id IN (?)',
                [userId, notificationIds]
            );
            return true;
        } catch (error) {
            logger.error('Bildirimleri okundu olarak işaretleme hatası:', error);
            throw error;
        }
    }
}

module.exports = UserService; 