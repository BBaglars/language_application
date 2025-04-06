const Admin = require('../models/Admin');
const logger = require('../utils/logger');
const { query } = require('../config/database');

class AdminService {
    static async createAdmin(adminData) {
        try {
            const newAdmin = await Admin.create(adminData);
            return newAdmin;
        } catch (error) {
            logger.error('Admin oluşturma hatası:', error);
            throw new Error('Admin oluşturulamadı');
        }
    }

    static async getAdminById(id) {
        try {
            const admin = await Admin.findById(id);
            if (!admin) {
                throw new Error('Admin bulunamadı');
            }
            return admin;
        } catch (error) {
            logger.error('Admin getirme hatası:', error);
            throw error;
        }
    }

    static async updateAdmin(id, adminData) {
        try {
            const updatedAdmin = await Admin.update(id, adminData);
            if (!updatedAdmin) {
                throw new Error('Admin bulunamadı');
            }
            return updatedAdmin;
        } catch (error) {
            logger.error('Admin güncelleme hatası:', error);
            throw error;
        }
    }

    static async deleteAdmin(id) {
        try {
            const result = await Admin.delete(id);
            if (!result) {
                throw new Error('Admin bulunamadı');
            }
            return true;
        } catch (error) {
            logger.error('Admin silme hatası:', error);
            throw error;
        }
    }

    static async getAdminLogs(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const logs = await query(
                'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [limit, offset]
            );
            return logs;
        } catch (error) {
            logger.error('Admin loglarını getirme hatası:', error);
            throw error;
        }
    }

    static async getSystemStats() {
        try {
            const stats = await query(
                `SELECT 
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM words) as total_words,
                    (SELECT COUNT(*) FROM game_sessions) as total_games,
                    (SELECT COUNT(*) FROM user_achievements) as total_achievements,
                    (SELECT COUNT(*) FROM ai_texts) as total_ai_texts
                `
            );
            return stats[0];
        } catch (error) {
            logger.error('Sistem istatistiklerini getirme hatası:', error);
            throw error;
        }
    }

    static async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `backups/backup-${timestamp}.sql`;
            
            // Veritabanı yedekleme komutu
            const backupCommand = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${backupPath}`;
            
            // Yedekleme işlemini gerçekleştir
            const { exec } = require('child_process');
            exec(backupCommand, (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
            });

            // Yedekleme kaydını veritabanına ekle
            const fileSize = require('fs').statSync(backupPath).size;
            await query(
                'INSERT INTO backup_history (backup_type, file_path, file_size, created_by) VALUES (?, ?, ?, ?)',
                ['full', backupPath, fileSize, 1] // created_by: 1 (sistem)
            );

            return { path: backupPath, size: fileSize };
        } catch (error) {
            logger.error('Yedekleme hatası:', error);
            throw new Error('Yedekleme yapılamadı');
        }
    }

    static async getBackupHistory() {
        try {
            const backups = await query(
                'SELECT * FROM backup_history ORDER BY created_at DESC'
            );
            return backups;
        } catch (error) {
            logger.error('Yedekleme geçmişini getirme hatası:', error);
            throw error;
        }
    }

    static async getSystemSettings() {
        try {
            const settings = await query('SELECT * FROM system_settings');
            return settings;
        } catch (error) {
            logger.error('Sistem ayarlarını getirme hatası:', error);
            throw error;
        }
    }

    static async updateSystemSettings(settings) {
        try {
            const connection = await require('../config/database').beginTransaction();
            
            try {
                for (const [key, value] of Object.entries(settings)) {
                    await query(
                        'INSERT INTO system_settings (key_name, value, description, created_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE value = ?',
                        [key, JSON.stringify(value), '', 1, JSON.stringify(value)]
                    );
                }
                
                await require('../config/database').commit(connection);
                return true;
            } catch (error) {
                await require('../config/database').rollback(connection);
                throw error;
            }
        } catch (error) {
            logger.error('Sistem ayarlarını güncelleme hatası:', error);
            throw new Error('Sistem ayarları güncellenemedi');
        }
    }

    static async logAdminAction(adminId, action, path, details = {}) {
        try {
            await query(
                'INSERT INTO admin_logs (admin_id, action, path, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
                [adminId, action, path, JSON.stringify(details), null, null]
            );
            return true;
        } catch (error) {
            logger.error('Admin log kaydı hatası:', error);
            throw error;
        }
    }
}

module.exports = AdminService; 