const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

class AuthService {
    static async verifyFirebaseToken(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return decodedToken;
        } catch (error) {
            logger.error('Firebase token doğrulama hatası:', error);
            throw new Error('Geçersiz token');
        }
    }

    static async createUser(firebaseUser) {
        try {
            const existingUser = await User.findOne({ firebase_uid: firebaseUser.uid });
            if (existingUser) {
                return existingUser;
            }

            const newUser = await User.create({
                firebase_uid: firebaseUser.uid,
                email: firebaseUser.email,
                username: firebaseUser.email.split('@')[0],
                full_name: firebaseUser.displayName || '',
                avatar_url: firebaseUser.photoURL || ''
            });

            return newUser;
        } catch (error) {
            logger.error('Kullanıcı oluşturma hatası:', error);
            throw new Error('Kullanıcı oluşturulamadı');
        }
    }

    static generateJWT(user) {
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        return token;
    }

    static async updateUserProfile(userId, profileData) {
        try {
            const updatedUser = await User.update(userId, profileData);
            return updatedUser;
        } catch (error) {
            logger.error('Profil güncelleme hatası:', error);
            throw new Error('Profil güncellenemedi');
        }
    }

    static async resetPassword(email) {
        try {
            await admin.auth().sendPasswordResetEmail(email);
            return true;
        } catch (error) {
            logger.error('Şifre sıfırlama hatası:', error);
            throw new Error('Şifre sıfırlama e-postası gönderilemedi');
        }
    }

    static async verifyEmail(token) {
        try {
            await admin.auth().verifyEmail(token);
            return true;
        } catch (error) {
            logger.error('E-posta doğrulama hatası:', error);
            throw new Error('E-posta doğrulanamadı');
        }
    }
}

module.exports = AuthService; 