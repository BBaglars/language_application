const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

const execAsync = promisify(exec);

class BackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '../../backups');
    }

    async init() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
            logger.info('Backup dizini oluşturuldu');
        } catch (error) {
            logger.error('Backup dizini oluşturma hatası:', error);
            throw error;
        }
    }

    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup_${timestamp}.sql`;
            const filepath = path.join(this.backupDir, filename);

            // MySQL dump komutu
            const command = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${filepath}`;
            
            await execAsync(command);
            logger.info(`Backup oluşturuldu: ${filename}`);

            // Eski backup'ları temizle (30 günden eski)
            await this.cleanOldBackups(30);

            return filepath;
        } catch (error) {
            logger.error('Backup oluşturma hatası:', error);
            throw error;
        }
    }

    async restoreBackup(filepath) {
        try {
            // Dosyanın varlığını kontrol et
            await fs.access(filepath);

            // MySQL restore komutu
            const command = `mysql -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} < ${filepath}`;
            
            await execAsync(command);
            logger.info(`Backup geri yüklendi: ${filepath}`);
        } catch (error) {
            logger.error('Backup geri yükleme hatası:', error);
            throw error;
        }
    }

    async cleanOldBackups(daysToKeep) {
        try {
            const files = await fs.readdir(this.backupDir);
            const now = new Date();

            for (const file of files) {
                const filepath = path.join(this.backupDir, file);
                const stats = await fs.stat(filepath);
                const daysOld = (now - stats.mtime) / (1000 * 60 * 60 * 24);

                if (daysOld > daysToKeep) {
                    await fs.unlink(filepath);
                    logger.info(`Eski backup silindi: ${file}`);
                }
            }
        } catch (error) {
            logger.error('Eski backup temizleme hatası:', error);
            throw error;
        }
    }

    async listBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backups = [];

            for (const file of files) {
                const filepath = path.join(this.backupDir, file);
                const stats = await fs.stat(filepath);
                backups.push({
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                });
            }

            return backups.sort((a, b) => b.modified - a.modified);
        } catch (error) {
            logger.error('Backup listesi alma hatası:', error);
            throw error;
        }
    }
}

module.exports = new BackupService(); 