const admin = require('../config/firebase');
const logger = require('../utils/logger');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Yetkilendirme token\'ı bulunamadı'
            });
        }

        const token = authHeader.split('Bearer ')[1];
        
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                role: decodedToken.role || 'user'
            };
            next();
        } catch (error) {
            logger.error('Token doğrulama hatası:', error);
            return res.status(401).json({
                status: 'error',
                message: 'Geçersiz token'
            });
        }
    } catch (error) {
        logger.error('Yetkilendirme hatası:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Sunucu hatası'
        });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Yetkilendirme gerekli'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        next();
    };
};

module.exports = {
    verifyToken,
    checkRole
}; 