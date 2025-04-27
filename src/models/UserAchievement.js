const { pool } = require('../db/db');

class UserAchievement {
    constructor(data) {
        this.user_id = data.user_id;
        this.achievement_id = data.achievement_id;
        this.earned_at = data.earned_at;
    }

    static async findByUserId(userId) {
        const result = await pool.query('SELECT * FROM user_achievements WHERE user_id = $1', [userId]);
        return result.rows.map(row => new UserAchievement(row));
    }

    static async findByAchievementId(achievementId) {
        const result = await pool.query('SELECT * FROM user_achievements WHERE achievement_id = $1', [achievementId]);
        return result.rows.map(row => new UserAchievement(row));
    }

    async save() {
        const result = await pool.query(
            'INSERT INTO user_achievements (user_id, achievement_id, earned_at) VALUES ($1, $2, $3) ON CONFLICT (user_id, achievement_id) DO UPDATE SET earned_at = EXCLUDED.earned_at RETURNING *',
            [this.user_id, this.achievement_id, this.earned_at]
        );
        return new UserAchievement(result.rows[0]);
    }

    async delete() {
        await pool.query('DELETE FROM user_achievements WHERE user_id = $1 AND achievement_id = $2', [this.user_id, this.achievement_id]);
    }
}

module.exports = UserAchievement; 