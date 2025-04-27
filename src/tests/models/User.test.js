const User = require('../../models/User');
const { pool } = require('../../db/db');

describe('User Model (Gerçek Veritabanı)', () => {
    let createdUserId;

    afterAll(async () => {
        // Testte eklenen kullanıcıyı temizle
        if (createdUserId) {
            await pool.query('DELETE FROM users WHERE id = $1', [createdUserId]);
        }
    });

    it('should create a User instance with correct properties', () => {
        const data = {
            id: 1,
            firebase_uid: 'firebase123',
            email: 'test@example.com',
            username: 'testuser',
            full_name: 'Test User',
            created_at: '2024-01-01',
            updated_at: '2024-01-02'
        };
        const user = new User(data);
        expect(user.id).toBe(data.id);
        expect(user.firebase_uid).toBe(data.firebase_uid);
        expect(user.email).toBe(data.email);
        expect(user.username).toBe(data.username);
        expect(user.full_name).toBe(data.full_name);
        expect(user.created_at).toBe(data.created_at);
    });

    it('should create a new user', async () => {
        const user = new User({
            firebase_uid: 'firebase999',
            email: 'newuser@example.com',
            username: 'newuser',
            full_name: 'New User'
        });
        const newUser = await user.save();
        expect(newUser).toBeInstanceOf(User);
        expect(newUser.email).toBe('newuser@example.com');
        createdUserId = newUser.id;
    });

    it('should find a user by id', async () => {
        const user = await User.findById(createdUserId);
        expect(user).toBeInstanceOf(User);
        expect(user.id).toBe(createdUserId);
    });

    it('should return null when user not found by id', async () => {
        const user = await User.findById(999999);
        expect(user).toBeNull();
    });

    it('should find a user by firebase_uid', async () => {
        const user = await User.findByFirebaseUid('firebase999');
        expect(user).toBeInstanceOf(User);
        expect(user.firebase_uid).toBe('firebase999');
    });

    it('should return null when user not found by firebase_uid', async () => {
        const user = await User.findByFirebaseUid('notfound');
        expect(user).toBeNull();
    });

    it('should update an existing user', async () => {
        let user = await User.findById(createdUserId);
        user.email = 'updated@example.com';
        user.username = 'updateduser';
        user.full_name = 'Updated User';
        const updatedUser = await user.save();
        expect(updatedUser).toBeInstanceOf(User);
        expect(updatedUser.email).toBe('updated@example.com');
        expect(updatedUser.username).toBe('updateduser');
        expect(updatedUser.full_name).toBe('Updated User');
    });
}); 