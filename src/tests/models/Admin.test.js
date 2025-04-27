const Admin = require('../../models/Admin');
const User = require('../../models/User');
const { pool } = require('../../db/db');

describe('Admin Model (Gerçek Veritabanı)', () => {
    let userId, adminId;

    beforeAll(async () => {
        // Gerekli foreign key kayıtlarını ekle
        const userRes = await pool.query("INSERT INTO users (firebase_uid, email, username) VALUES ('adminuid', 'admin@example.com', 'adminuser') RETURNING id");
        userId = userRes.rows[0].id;
    });

    afterAll(async () => {
        if (adminId) {
            await pool.query('DELETE FROM admins WHERE id = $1', [adminId]);
        }
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('should create an Admin instance with correct properties', () => {
        const data = {
            id: 1,
            user_id: 2,
            role: 'super_admin',
            permissions: { all: true },
            created_at: '2024-01-01',
            updated_at: '2024-01-02'
        };
        const admin = new Admin(data);
        expect(admin.id).toBe(data.id);
        expect(admin.user_id).toBe(data.user_id);
        expect(admin.role).toBe(data.role);
        expect(admin.permissions).toEqual(data.permissions);
        expect(admin.created_at).toBe(data.created_at);
        expect(admin.updated_at).toBe(data.updated_at);
    });

    it('should create a new admin', async () => {
        const admin = new Admin({ user_id: userId, role: 'admin', permissions: { all: true } });
        const newAdmin = await admin.save();
        expect(newAdmin).toBeInstanceOf(Admin);
        expect(newAdmin.user_id).toBe(userId);
        expect(newAdmin.role).toBe('admin');
        expect(newAdmin.permissions).toEqual({ all: true });
        adminId = newAdmin.id;
    });

    it('should find an admin by id', async () => {
        const admin = await Admin.findById(adminId);
        expect(admin).toBeInstanceOf(Admin);
        expect(admin.id).toBe(adminId);
    });

    it('should return null when admin not found by id', async () => {
        const admin = await Admin.findById(999999);
        expect(admin).toBeNull();
    });

    it('should find an admin by userId', async () => {
        const admin = await Admin.findByUserId(userId);
        expect(admin).toBeInstanceOf(Admin);
        expect(admin.user_id).toBe(userId);
    });

    it('should update an existing admin', async () => {
        let admin = await Admin.findById(adminId);
        admin.role = 'super_admin';
        admin.permissions = { all: true };
        const updatedAdmin = await admin.save();
        expect(updatedAdmin).toBeInstanceOf(Admin);
        expect(updatedAdmin.role).toBe('super_admin');
        expect(updatedAdmin.permissions).toEqual({ all: true });
    });
}); 