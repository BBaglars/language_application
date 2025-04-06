const Game = require('../models/Game');
const logger = require('../utils/logger');
const { query } = require('../config/database');

class GameService {
    static async createGameSession(sessionData) {
        try {
            const newSession = await Game.createSession(sessionData);
            return newSession;
        } catch (error) {
            logger.error('Oyun oturumu oluşturma hatası:', error);
            throw new Error('Oyun oturumu oluşturulamadı');
        }
    }

    static async getGameSessionById(id) {
        try {
            const session = await Game.getSessionById(id);
            if (!session) {
                throw new Error('Oyun oturumu bulunamadı');
            }
            return session;
        } catch (error) {
            logger.error('Oyun oturumu getirme hatası:', error);
            throw error;
        }
    }

    static async updateGameSession(id, sessionData) {
        try {
            const updatedSession = await Game.updateSession(id, sessionData);
            if (!updatedSession) {
                throw new Error('Oyun oturumu bulunamadı');
            }
            return updatedSession;
        } catch (error) {
            logger.error('Oyun oturumu güncelleme hatası:', error);
            throw error;
        }
    }

    static async getGameTypes() {
        try {
            const types = await query('SELECT * FROM game_types');
            return types;
        } catch (error) {
            logger.error('Oyun tiplerini getirme hatası:', error);
            throw error;
        }
    }

    static async getUserSessions(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const sessions = await query(
                'SELECT * FROM game_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?',
                [userId, limit, offset]
            );
            return sessions;
        } catch (error) {
            logger.error('Kullanıcı oturumlarını getirme hatası:', error);
            throw error;
        }
    }

    static async saveGameAnswer(answerData) {
        try {
            const result = await query(
                'INSERT INTO game_answers (session_id, word_id, user_answer, is_correct) VALUES (?, ?, ?, ?)',
                [answerData.session_id, answerData.word_id, answerData.user_answer, answerData.is_correct]
            );
            return result;
        } catch (error) {
            logger.error('Oyun cevabı kaydetme hatası:', error);
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

    static async getLeaderboard(gameTypeId, limit = 10) {
        try {
            const leaderboard = await query(
                `SELECT 
                    u.username,
                    u.avatar_url,
                    COUNT(DISTINCT gs.id) as total_games,
                    AVG(gs.score) as average_score,
                    MAX(gs.score) as highest_score
                FROM game_sessions gs
                JOIN users u ON gs.user_id = u.id
                WHERE gs.game_type_id = ?
                GROUP BY u.id
                ORDER BY average_score DESC
                LIMIT ?`,
                [gameTypeId, limit]
            );
            return leaderboard;
        } catch (error) {
            logger.error('Liderlik tablosu getirme hatası:', error);
            throw error;
        }
    }

    static async checkAchievements(userId) {
        try {
            // Kullanıcının son oyun istatistiklerini al
            const stats = await query(
                `SELECT 
                    COUNT(DISTINCT gs.id) as total_games,
                    AVG(gs.score) as average_score,
                    MAX(gs.score) as highest_score,
                    COUNT(DISTINCT CASE WHEN ga.is_correct = 1 THEN ga.word_id END) as correct_answers
                FROM game_sessions gs
                LEFT JOIN game_answers ga ON gs.id = ga.session_id
                WHERE gs.user_id = ?`,
                [userId]
            );

            // Başarıları kontrol et ve kazanılanları ekle
            const achievements = await query(
                'SELECT * FROM achievements WHERE id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = ?)',
                [userId]
            );

            const earnedAchievements = [];
            for (const achievement of achievements) {
                let earned = false;
                
                switch (achievement.name) {
                    case 'First Game':
                        if (stats[0].total_games >= 1) earned = true;
                        break;
                    case 'Perfect Score':
                        if (stats[0].highest_score >= 100) earned = true;
                        break;
                    case 'Word Master':
                        if (stats[0].correct_answers >= 1000) earned = true;
                        break;
                    // Diğer başarılar...
                }

                if (earned) {
                    await query(
                        'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
                        [userId, achievement.id]
                    );
                    earnedAchievements.push(achievement);
                }
            }

            return earnedAchievements;
        } catch (error) {
            logger.error('Başarı kontrolü hatası:', error);
            throw error;
        }
    }
}

module.exports = GameService; 