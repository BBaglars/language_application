const fs = require('fs').promises;
const path = require('path');
const { pool } = require('./index');
const logger = require('../utils/logger');

class MigrationManager {
    constructor() {
        this.migrationsPath = path.join(__dirname, 'migrations');
    }

    async init() {
        const connection = await pool.getConnection();
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(255) NOT NULL,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            logger.info('Migrations tablosu oluşturuldu');
        } finally {
            connection.release();
        }
    }

    async getExecutedMigrations() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query('SELECT name FROM migrations');
            return rows.map(row => row.name);
        } finally {
            connection.release();
        }
    }

    async getMigrationFiles() {
        const files = await fs.readdir(this.migrationsPath);
        return files
            .filter(file => file.endsWith('.js'))
            .sort();
    }

    async runMigrations() {
        await this.init();
        
        const executedMigrations = await this.getExecutedMigrations();
        const migrationFiles = await this.getMigrationFiles();
        
        for (const file of migrationFiles) {
            if (!executedMigrations.includes(file)) {
                logger.info(`Migrasyon çalıştırılıyor: ${file}`);
                
                const migration = require(path.join(this.migrationsPath, file));
                await migration.up();
                
                const connection = await pool.getConnection();
                try {
                    await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
                } finally {
                    connection.release();
                }
                
                logger.info(`Migrasyon tamamlandı: ${file}`);
            }
        }
    }

    async rollback() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query('SELECT name FROM migrations ORDER BY id DESC LIMIT 1');
            if (rows.length > 0) {
                const lastMigration = rows[0].name;
                const migration = require(path.join(this.migrationsPath, lastMigration));
                
                logger.info(`Rollback yapılıyor: ${lastMigration}`);
                await migration.down();
                
                await connection.query('DELETE FROM migrations WHERE name = ?', [lastMigration]);
                logger.info(`Rollback tamamlandı: ${lastMigration}`);
            }
        } finally {
            connection.release();
        }
    }
}

// CLI komutlarını işle
const command = process.argv[2];
const migrationManager = new MigrationManager();

async function main() {
    try {
        switch (command) {
            case 'up':
                await migrationManager.runMigrations();
                break;
            case 'down':
                await migrationManager.rollback();
                break;
            default:
                console.log('Kullanım: node migrate.js [up|down]');
                process.exit(1);
        }
    } catch (error) {
        logger.error('Migrasyon hatası:', error);
        process.exit(1);
    }
}

main(); 