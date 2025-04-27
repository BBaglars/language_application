const AdminService = require('../../services/AdminService');
const Admin = require('../../models/Admin');
const User = require('../../models/User');

// Mock the models
jest.mock('../../models/Admin');
jest.mock('../../models/User');

describe('AdminService', () => {
    let adminService;

    beforeEach(() => {
        adminService = new AdminService();
        jest.clearAllMocks();
    });

    describe('createAdmin', () => {
        it('should create a new admin', async () => {
            const mockUser = {
                id: 1,
                firebase_uid: 'firebase123',
                email: 'admin@example.com'
            };
            const mockAdmin = {
                id: 1,
                user_id: 1,
                role: 'admin'
            };

            User.findByFirebaseUid.mockResolvedValue(mockUser);
            Admin.prototype.save.mockResolvedValue(mockAdmin);

            const result = await adminService.createAdmin({
                firebaseUid: 'firebase123',
                role: 'admin'
            });

            expect(result).toBe(mockAdmin);
            expect(User.findByFirebaseUid).toHaveBeenCalledWith('firebase123');
            expect(Admin.prototype.save).toHaveBeenCalled();
        });

        it('should throw error if user not found', async () => {
            User.findByFirebaseUid.mockResolvedValue(null);

            await expect(adminService.createAdmin({
                firebaseUid: 'firebase123',
                role: 'admin'
            })).rejects.toThrow('User not found');
        });
    });

    describe('getAdmin', () => {
        it('should return admin by id', async () => {
            const mockAdmin = {
                id: 1,
                user_id: 1,
                role: 'admin'
            };

            Admin.findById.mockResolvedValue(mockAdmin);

            const result = await adminService.getAdmin(1);

            expect(result).toBe(mockAdmin);
            expect(Admin.findById).toHaveBeenCalledWith(1);
        });

        it('should return null if admin not found', async () => {
            Admin.findById.mockResolvedValue(null);

            const result = await adminService.getAdmin(1);

            expect(result).toBeNull();
        });
    });

    describe('getAdminByUserId', () => {
        it('should return admin by user id', async () => {
            const mockAdmin = {
                id: 1,
                user_id: 1,
                role: 'admin'
            };

            Admin.findByUserId.mockResolvedValue(mockAdmin);

            const result = await adminService.getAdminByUserId(1);

            expect(result).toBe(mockAdmin);
            expect(Admin.findByUserId).toHaveBeenCalledWith(1);
        });

        it('should return null if admin not found', async () => {
            Admin.findByUserId.mockResolvedValue(null);

            const result = await adminService.getAdminByUserId(1);

            expect(result).toBeNull();
        });
    });

    describe('updateAdmin', () => {
        it('should update admin role', async () => {
            const mockAdmin = {
                id: 1,
                user_id: 1,
                role: 'admin',
                save: jest.fn().mockResolvedValue({ id: 1, user_id: 1, role: 'super_admin' })
            };

            Admin.findById.mockResolvedValue(mockAdmin);

            const result = await adminService.updateAdmin(1, { role: 'super_admin' });

            expect(result.role).toBe('super_admin');
            expect(mockAdmin.save).toHaveBeenCalled();
        });

        it('should throw error if admin not found', async () => {
            Admin.findById.mockResolvedValue(null);

            await expect(adminService.updateAdmin(1, { role: 'super_admin' }))
                .rejects.toThrow('Admin not found');
        });
    });

    describe('deleteAdmin', () => {
        it('should delete admin', async () => {
            const mockAdmin = {
                id: 1,
                delete: jest.fn().mockResolvedValue(true)
            };

            Admin.findById.mockResolvedValue(mockAdmin);

            await adminService.deleteAdmin(1);

            expect(mockAdmin.delete).toHaveBeenCalled();
        });

        it('should throw error if admin not found', async () => {
            Admin.findById.mockResolvedValue(null);

            await expect(adminService.deleteAdmin(1))
                .rejects.toThrow('Admin not found');
        });
    });

    describe('getAllAdmins', () => {
        it('should return all admins', async () => {
            const mockAdmins = [
                { id: 1, user_id: 1, role: 'admin' },
                { id: 2, user_id: 2, role: 'super_admin' }
            ];

            Admin.findAll.mockResolvedValue(mockAdmins);

            const result = await adminService.getAllAdmins();

            expect(result).toEqual(mockAdmins);
            expect(Admin.findAll).toHaveBeenCalled();
        });
    });
}); 