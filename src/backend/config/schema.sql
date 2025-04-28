-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diller tablosu
CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    native_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kelimeler tablosu
CREATE TABLE IF NOT EXISTS words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(100) NOT NULL,
    meaning TEXT NOT NULL,
    language_id INTEGER REFERENCES languages(id),
    difficulty_level VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kelime-Kategori ilişki tablosu
CREATE TABLE IF NOT EXISTS word_categories (
    word_id INTEGER REFERENCES words(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (word_id, category_id)
);

-- Örnek cümleler tablosu
CREATE TABLE IF NOT EXISTS example_sentences (
    id SERIAL PRIMARY KEY,
    sentence TEXT NOT NULL,
    word_id INTEGER REFERENCES words(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Oyunlar tablosu
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hikayeler tablosu
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hikaye-Kelime ilişki tablosu
CREATE TABLE IF NOT EXISTS story_words (
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    word_id INTEGER REFERENCES words(id) ON DELETE CASCADE,
    PRIMARY KEY (story_id, word_id)
);

-- Çeviriler tablosu
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    source_word_id INTEGER REFERENCES words(id) ON DELETE CASCADE,
    target_word_id INTEGER REFERENCES words(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 