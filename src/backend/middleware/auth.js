const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const { pool } = require('../db');

const auth = async (req, res, next) => {
    try {
        // Test ortamında kullanıcı kontrolünü atla
        if (process.env.NODE_ENV === 'test') {
            req.user = { id: 1 };
            return next();
        }

        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            next(new AppError('Token bulunamadı', 401));
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

        if (rows.length === 0) {
            next(new AppError('Kullanıcı bulunamadı', 401));
            return;
        }

        req.user = rows[0];
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError('Geçersiz token', 401));
        } else if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Yetkilendirme hatası', 401));
        }
    }
};

module.exports = auth; 