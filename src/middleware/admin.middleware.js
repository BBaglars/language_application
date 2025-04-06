const adminService = require('../services/admin.service');
const firebaseAuthService = require('../services/firebase-auth.service');

const adminMiddleware = {
    // Admin yetkisi kontrolü
    requireAdmin: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'Yetkilendirme token\'ı gerekli' });
            }

            const decodedToken = await firebaseAuthService.verifyToken(token);
            const admin = await adminService.getAdminByFirebaseUid(decodedToken.uid);

            if (!admin || !admin.is_active) {
                return res.status(403).json({ error: 'Admin yetkisi gerekli' });
            }

            req.admin = admin;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Geçersiz token' });
        }
    },

    // Belirli bir yetki kontrolü
    requirePermission: (permission) => {
        return async (req, res, next) => {
            try {
                const hasPermission = await adminService.checkPermission(req.admin.id, permission);
                if (!hasPermission) {
                    return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
                }
                next();
            } catch (error) {
                res.status(500).json({ error: 'Yetki kontrolü sırasında hata oluştu' });
            }
        };
    },

    // Admin işlemleri için log tutma
    logAdminAction: async (req, res, next) => {
        try {
            const adminId = req.admin.id;
            const action = req.method;
            const path = req.path;
            const timestamp = new Date();

            await db.query(
                `INSERT INTO admin_logs (admin_id, action, path, timestamp)
                 VALUES ($1, $2, $3, $4)`,
                [adminId, action, path, timestamp]
            );

            next();
        } catch (error) {
            console.error('Admin log hatası:', error);
            next();
        }
    }
};

module.exports = adminMiddleware; 