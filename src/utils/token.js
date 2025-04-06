const jwt = require('jsonwebtoken');
const logger = require('./logger');

class TokenService {
    static generateTokens(user) {
        try {
            const accessToken = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );
            
            return { accessToken, refreshToken };
        } catch (error) {
            logger.error('Token oluşturma hatası:', error);
            throw error;
        }
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            logger.error('Token doğrulama hatası:', error);
            throw error;
        }
    }

    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            logger.error('Refresh token doğrulama hatası:', error);
            throw error;
        }
    }
}

module.exports = TokenService; 