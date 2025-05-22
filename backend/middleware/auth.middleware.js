const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errors.js');

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
    try {
        // Token kontrolü
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('Yetkilendirme başarısız: Token bulunamadı', 401));
        }

        const token = authHeader.split(' ')[1];

        // Token doğrulama
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');

        // Kullanıcı kontrolü
        const user = await prisma.user.findUnique({
            where: { id: decoded.id || decoded.userId }
        });

        if (!user) {
            return next(new AppError('Yetkilendirme başarısız: Kullanıcı bulunamadı', 401));
        }

        // Kullanıcı bilgisini request'e ekle
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Yetkilendirme başarısız: Geçersiz token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Yetkilendirme başarısız: Token süresi doldu', 401));
        }
        next(new AppError(error.message, 500));
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Yetkilendirme gerekli', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Bu işlem için yetkiniz yok', 403));
        }

        next();
    };
};

// Kullanıcı kaynağı kontrolü middleware'i
const checkOwnership = (model) => {
    return async (req, res, next) => {
        try {
            const resource = await prisma[model].findUnique({
                where: { id: parseInt(req.params.id) }
            });

            if (!resource) {
                return next(new AppError(`${model} bulunamadı`, 404));
            }

            if (resource.userId !== req.user.id && req.user.role !== 'ADMIN') {
                return next(new AppError('Bu kaynağı düzenleme yetkiniz yok', 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authenticate,
    authorize,
    checkOwnership
}; 