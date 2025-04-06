const { query } = require('../index');

async function up() {
    try {
        // Users tablosu
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                firebase_uid VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(100),
                avatar_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Languages tablosu
        await query(`
            CREATE TABLE IF NOT EXISTS languages (
                id SERIAL PRIMARY KEY,
                code VARCHAR(10) UNIQUE NOT NULL,
                name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Categories tablosu
        await query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                parent_id INTEGER REFERENCES categories(id),
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Words tablosu
        await query(`
            CREATE TABLE IF NOT EXISTS words (
                id SERIAL PRIMARY KEY,
                word VARCHAR(255) NOT NULL,
                letter_count INTEGER GENERATED ALWAYS AS (LENGTH(word)) STORED,
                language_id INTEGER REFERENCES languages(id),
                difficulty_level VARCHAR(10) NOT NULL,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Word translations tablosu
        await query(`
            CREATE TABLE IF NOT EXISTS word_translations (
                id SERIAL PRIMARY KEY,
                word_id INTEGER REFERENCES words(id),
                language_id INTEGER REFERENCES languages(id),
                translation TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(word_id, language_id)
            );
        `);

        // Word categories tablosu
        await query(`
            CREATE TABLE IF NOT EXISTS word_categories (
                word_id INTEGER REFERENCES words(id),
                category_id INTEGER REFERENCES categories(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (word_id, category_id)
            );
        `);

        // User word levels tablosu
        await query(`
            CREATE TABLE IF NOT EXISTS user_word_levels (
                user_id INTEGER REFERENCES users(id),
                word_id INTEGER REFERENCES words(id),
                level INTEGER NOT NULL DEFAULT 0,
                last_reviewed TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, word_id)
            );
        `);

        console.log('Migration başarıyla tamamlandı');
    } catch (error) {
        console.error('Migration hatası:', error);
        throw error;
    }
}

async function down() {
    try {
        await query('DROP TABLE IF EXISTS user_word_levels');
        await query('DROP TABLE IF EXISTS word_categories');
        await query('DROP TABLE IF EXISTS word_translations');
        await query('DROP TABLE IF EXISTS words');
        await query('DROP TABLE IF EXISTS categories');
        await query('DROP TABLE IF EXISTS languages');
        await query('DROP TABLE IF EXISTS users');
        console.log('Rollback başarıyla tamamlandı');
    } catch (error) {
        console.error('Rollback hatası:', error);
        throw error;
    }
}

module.exports = { up, down }; 